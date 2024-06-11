// import express from 'express';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class WebService {
//     private app: express.Express;
//     private route: express.Router;

//     public constructor() {
//         this.app = express();
//         this.route = express.Router();

//         this.app.use(express.json());
//         this.configureRoutes();
//         this.app.use(this.route);
//     }

//     private configureRoutes(): void {}

//     public async start(): Promise<void> {
//         const port = process.env.PORT ?? 8888;
//         this.app.listen(port, () => `server running on port ${port}`);
//     }
// }
