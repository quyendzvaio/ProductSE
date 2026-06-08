import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { postChatMessage } from '../../lib/api';
import Chatbot from './Chatbot';


vi.mock('../../lib/api', () => ({
  postChatMessage: vi.fn(),
}));

describe('Chatbot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes a session and renders product links from a recommendation', async () => {
    postChatMessage
      .mockResolvedValueOnce({
        session_id: 'session-1',
        type: 'message',
        content: 'Chào bạn, mình có thể hỗ trợ gì cho bạn?',
        products: [],
      })
      .mockResolvedValueOnce({
        session_id: 'session-1',
        type: 'recommendation',
        content: 'Mình nghiêng về hai lựa chọn này cho bạn.',
        products: [
          {
            product_code: 'kombucha-vi-nho',
            product_name: 'Kombucha vị nho',
          },
          {
            product_code: 'kombucha-vi-luu-do',
            product_name: 'Kombucha vị lựu đỏ',
          },
        ],
      });

    const user = userEvent.setup();
    render(<Chatbot />);

    expect(
      await screen.findByText('Chào bạn, mình có thể hỗ trợ gì cho bạn?'),
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Nhập tin nhắn...'), 'Ít đường');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));

    expect(
      await screen.findByText('Mình nghiêng về hai lựa chọn này cho bạn.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /kombucha vị nho/i }),
    ).toHaveAttribute('href', 'http://localhost:5173/?product=kombucha-vi-nho');
    expect(postChatMessage).toHaveBeenNthCalledWith(2, {
      message: 'Ít đường',
      sessionId: 'session-1',
    });

    await waitFor(() => {
      expect(screen.queryByText('Mình đang xem thông tin...')).not.toBeInTheDocument();
    });
  });
});
