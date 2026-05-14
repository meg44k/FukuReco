/** @vitest-environment jsdom */
import {render, screen} from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Price } from './Price'

describe('Price コンポーネント', () => {
  it('数値が渡されたときにカンマ区切りで表示されるか', ()=>{
    render(<Price price={1234}/>);
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('¥')).toBeInTheDocument();
  });

  it('priceがnullまたはundefinedの時何も表示されないか', ()=>{
    const {container} = render(<Price price={null}/>);
    expect(container).toBeEmptyDOMElement();
  });

  it('数値として解釈できない文字の時、そのまま表示されるか', ()=>{
    render(<Price price="Ask"/>);
    expect(screen.getByText('Ask')).toBeInTheDocument();
  });
});
