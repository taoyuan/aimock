import {tokenize} from '../../tokenize';

describe('tokenize function', () => {
  it('should tokenize the content correctly', () => {
    const content = 'Hello, 世界! How are you?';

    // Expected tokens based on the provided regex
    const expectedTokens = ['Hello', ',', ' ', '世', '界', '!', ' ', 'How', ' ', 'are', ' ', 'you', '?'];

    const result = tokenize(content);
    expect(result).toEqual(expectedTokens);
  });

  it('should handle empty content', () => {
    const content = '';

    const result = tokenize(content);
    expect(result).toEqual([]);
  });

  it('should handle content with only spaces', () => {
    const content = '    ';

    const result = tokenize(content);
    expect(result).toEqual([content]);
  });
});
