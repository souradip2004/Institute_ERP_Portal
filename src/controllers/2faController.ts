import { NextApiRequest, NextApiResponse } from 'next';
import { TwoFAService } from '@/services/2faService';

export class TwoFAController {
  private twoFAService = new TwoFAService();

  async enable2FA(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const twoFAData = await this.twoFAService.enable2FA(userId);
      return res.status(200).json(twoFAData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async verify2FA(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userId, token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ error: 'User ID and token are required' });
      }

      const isValid = await this.twoFAService.verify2FA(userId, token);
      if (!isValid ) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      return res.status(200).json({ message: '2FA verification successful' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
