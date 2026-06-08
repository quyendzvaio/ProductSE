import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Botchat from './Botchat';


describe('Botchat', () => {
  it('renders clickable links for recommended products', () => {
    render(
      <Botchat
        content="Mình đã chọn hai vị phù hợp cho bạn."
        products={[
          {
            product_code: 'kombucha-vi-nho',
            product_name: 'Kombucha vị nho',
          },
          {
            product_code: 'kombucha-vi-luu-do',
            product_name: 'Kombucha vị lựu đỏ',
          },
        ]}
      />,
    );

    const grapeLink = screen.getByRole('link', { name: /kombucha vị nho/i });
    const pomegranateLink = screen.getByRole('link', {
      name: /kombucha vị lựu đỏ/i,
    });

    expect(grapeLink).toHaveAttribute(
      'href',
      'http://localhost:5173/?product=kombucha-vi-nho',
    );
    expect(pomegranateLink).toHaveAttribute(
      'href',
      'http://localhost:5173/?product=kombucha-vi-luu-do',
    );
    expect(grapeLink).toHaveAttribute('target', '_blank');
  });
});
