import { WebSocketServer } from "ws";
import { Client, type Notification } from "pg";
import type { Message } from "./models/Message.interface";

const server = new WebSocketServer({
    port: 8082
});

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});
await client.connect();

function parseMsg(msg: Notification) {
    const code = msg.channel;
    const payload = msg.payload ? JSON.parse(msg.payload) : null;

    return { code, payload };
}

server.on("connection", socket => {
    let code = "", listener: (msg: Notification) => unknown;

    console.log("Client connected");

    async function cleanConnection() {
        if (code)
            await client.query(`UNLISTEN "${code}"`);
        if (listener)
            client.off("notification", listener);
    }

    socket.on("message", async message => {
        let parsed: Message;

        try {
            parsed = JSON.parse(message.toString());
        }
        catch (err) {
            console.error("Invalid JSON received");
            socket.send(JSON.stringify({ type: "error", error: "invalidData" }));
            socket.close(1000, "Invalid JSON");
            return;
        }

        const { type, data } = parsed;
        if (!type || !data) {
            socket.send(JSON.stringify({ type: "error", error: "typeMissing" }));
            socket.close(1000, "Missing type or data.");
            return;
        }

        if (type === "offer") {
            const offer = data.offer;
            code = generateCode();

            socket.send(JSON.stringify({ type: "code", data: { code } }));
            await client.query(`LISTEN "${code}"`);

            const timeout = setTimeout(async () => {
                console.log(`Timeout reached for code ${code}, closing LISTEN`);
                cleanConnection();
                socket.send(JSON.stringify({ type: "error", error: "timeout" }));
                socket.close(1000, "Timeout reached.");
            }, 600000);

            listener = async (msg: Notification) => {
                if (!msg.payload || msg.channel !== code)
                    return;
            
                const { payload } = parseMsg(msg);

                if (payload.type === "ping")
                    client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "echo" })}'`);
                else if (payload.type === "getOffer") {
                    client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "offer", data: { offer } })}'`);
                    clearTimeout(timeout);
                }
                else if (payload.type === "setAnswer")
                    socket.send(JSON.stringify({ type: "answer", data: payload.data }));
                else if (payload.type === "iceReceiver")
                    socket.send(JSON.stringify({ type: "iceReceiver", data: payload.data }));
            }

            client.on("notification", listener);
        }
        else if (type === "connect") {
            code = data.code;
            if (!code) {
                socket.send(JSON.stringify({ type: "error", error: "invalidCode" }));
                socket.close(1000, "Missing code");
                return;
            }

            await client.query(`LISTEN "${code}"`);

            const timeout = setTimeout(() => {
                socket.send(JSON.stringify({ type: "error", error: "invalidCode" }));
                socket.close(1000, "Invalid code");
            }, 4000);

            listener = async (msg: Notification) => {
                if (!msg.payload || msg.channel !== code)
                    return;
            
                const { payload } = parseMsg(msg);

                if (payload.type === "echo") {
                    client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "getOffer" })}'`);
                    clearTimeout(timeout);
                }
                else if (payload.type === "offer") {
                    socket.send(JSON.stringify({ type: "offer", data: payload.data }));
                    cleanConnection();
                }
            }

            client.on("notification", listener);
            client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "ping" })}'`);
        }
        else if (type === "answer") {
            const answer = data.answer;
            code = data.code;
            if (!code) {
                socket.send(JSON.stringify({ type: "error", error: "invalidCode" }));
                socket.close(1000, "Missing code");
                return;
            }

            await client.query(`LISTEN "${code}"`);

            listener = async (msg: Notification) => {
                if (!msg.payload || msg.channel !== code)
                    return;
            
                const { payload } = parseMsg(msg);

                if (payload.type === "iceSender")
                    socket.send(JSON.stringify({ type: "ice", data: payload.data }));
            }

            client.on("notification", listener);
            client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "setAnswer", data: { answer } })}'`);
        }
        else if (type === "iceSender") {
            const ice = data.ice;
            code = data.code;
            if (!code) {
                socket.send(JSON.stringify({ type: "error", error: "invalidCode" }));
                socket.close(1000, "Missing code");
                return;
            }

            client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "iceSender", data: { ice } })}'`);
        }
        else if (type === "iceReceiver") {
            const ice = data.ice;
            code = data.code;
            if (!code) {
                socket.send(JSON.stringify({ type: "error", error: "invalidCode" }));
                socket.close(1000, "Missing code");
                return;
            }

            client.query(`NOTIFY "${code}", '${JSON.stringify({ type: "iceReceiver", data: { ice } })}'`);
        }
        else {
            socket.send(JSON.stringify({ type: "error", error: "unknownType" }));
            socket.close(1000, "Unknown message type.")
        }
    });

    socket.on("close", async () => {
        console.log("Client disconnected");

        cleanConnection();
    });
});

console.log("Server started.");