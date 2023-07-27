import express, {Request, Response, Router} from 'express';

export function image() {
  const router: Router = express.Router();

  router.post('/v1/images/generations', (req: Request, res: Response) => {
    const {prompt, n}: {prompt: string; n?: number} = req.body;

    // Check if 'prompt' is provided and is a string
    if (!prompt) {
      return res.status(400).json({error: 'Missing or invalid "prompt" in request body'});
    }

    let nn: number = n || 1;
    if (nn > 10) {
      nn = 10;
    }
    const url =
      'https://images.unsplash.com/photo-1661956602926-db6b25f75947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1298&q=80';
    const images: string[] = [];
    for (let i = 0; i < nn; i++) {
      images.push(url);
    }
    const response: {created: number; data: string[]} = {
      created: Math.floor(Date.now() / 1000),
      data: images,
    };

    res.json(response);
  });

  return router;
}

export default image;
