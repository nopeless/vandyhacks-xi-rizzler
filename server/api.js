import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'working' });
});

export default router;
