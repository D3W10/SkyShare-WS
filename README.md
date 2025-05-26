<br />
<br />
<div align="center">
    <a href="https://github.com/D3W10/SkyShare-WS">
        <img src="https://raw.githubusercontent.com/D3W10/SkyShare/main/svelte/static/logo.png" alt="Logo" width="60" height="60">
    </a>
    <br />
    <br />
    <h2 align="center">SkyShare WebSocket Server</h2>
    <h3 align="center">The WebSocket server for SkyShare</h3>
    <br />
    <p align="center">
        <a href="https://github.com/D3W10/SkyShare-WS/issues">Report Bug</a>
        ·
        <a href="https://github.com/D3W10/SkyShare-WS/issues">Request Feature</a>
    </p>
</div>
<br />

### Table of Contents
1. [About](#about)
    - [Built With](#built-with)
2. [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
3. [License](#license)
4. [Credits](#credits)

<br />
<br />

## About

SkyShare WebSocket Server is the bridge that allows 2 peers to exchange their WebRTC signals, helping in establishing a connection between them.

This project consists in four different subprojects:
> 🖥️&emsp;SkyShare [Desktop App](https://github.com/D3W10/SkyShare)
>
> 🔗&emsp;SkyShare [WebSocket Server](https://github.com/D3W10/SkyShare-WS)

<br />

### Built With

- [TypeScript](https://www.typescriptlang.org/)
- WebSockets

<br />
<br />

## Development

If you want to deploy a copy of SkyShare WebSocket Server on your device to develop a feature or fix a bug, follow the steps below to get started.

<br />

### Prerequisites

In order to run the application, you will need the following tools:
- Node.JS (`20.0.0` or higher);
- bun (or equivalent);
- git (*optional*).

<br />

### Installation

1. Clone the repository
    ```sh
    git clone https://github.com/D3W10/SkyShare-WS.git
    ```
2. Open the project folder using your prefered code editor (ex: VS Code)
3. Install the required dependencies on both the backend and frontend
    ```sh
    bun i
    ```
4. On the project root run the following command to run the server
    ```sh
    bun run dev
    ```

<br />
<br />

## License

Distributed under the Mozilla Public License 2.0. Check `LICENSE` for more details.

<br />
<br />

## Credits

- [Daniel Nunes](https://d3w10.netlify.app/)
- Mihail Arcus