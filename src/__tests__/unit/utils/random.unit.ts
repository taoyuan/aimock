import {MockRandoms} from '../../../utils/randoms';

describe('load function', () => {
  beforeEach(() => {
    MockRandoms.clear();
  });

  it('should load random responses if filePath is empty', async () => {
    await MockRandoms.load();

    const responses = MockRandoms.getRandomContents();
    expect(responses).toEqual([
      'This is a random response 1.',
      'This is a random response 2.',
      'This is a random response 3.',
    ]);
  });

  it('should load responses from the specified file', async () => {
    const filePath = '/data/contents.txt';

    await MockRandoms.load(filePath);

    const responses = MockRandoms.getRandomContents();
    // Add your expectations based on the contents of the file
    expect(responses).toMatchSnapshot();
  });

  it('should load empty responses for non-existent file', async () => {
    const filePath = 'non_existent_file.txt'; // A non-existent file path

    await MockRandoms.load(filePath);

    const responses = MockRandoms.getRandomContents();
    expect(responses).toEqual([]);
  });
});

describe('randomContents function', () => {
  it('should return an array of random responses', () => {
    // Assuming you have already loaded some random responses
    // using the load function before this test case
    const responses = MockRandoms.getRandomContents();

    // Add your expectations based on the loaded random responses
    expect(Array.isArray(responses)).toBe(true);
    expect(responses.length).toBeGreaterThanOrEqual(0);
  });
});
