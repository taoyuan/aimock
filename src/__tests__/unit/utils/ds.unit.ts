import {AIMockDS} from '../../../utils/ds';

describe('AIMockDS', () => {
  it('should load random responses if filePath is empty', async () => {
    const ds = await AIMockDS.load();

    const responses = ds.data;
    expect(responses).toEqual([
      'This is a random response 1.',
      'This is a random response 2.',
      'This is a random response 3.',
    ]);
  });

  it('should load responses from the specified file', async () => {
    const filePath = '/data/contents.txt';

    const ds = await AIMockDS.load(filePath);

    const responses = ds.data;
    // Add your expectations based on the contents of the file
    expect(responses).toMatchSnapshot();
  });

  it('should load empty responses for non-existent file', async () => {
    const filePath = 'non_existent_file.txt'; // A non-existent file path

    const ds = await AIMockDS.load(filePath);

    const responses = ds.data;
    expect(responses).toEqual([]);
  });

  it('should return an array of random responses', () => {
    const ds = new AIMockDS();
    // Assuming you have already loaded some random responses
    // using the load function before this test case
    const responses = ds.data;

    // Add your expectations based on the loaded random responses
    expect(Array.isArray(responses)).toBe(true);
    expect(responses.length).toBeGreaterThanOrEqual(0);
  });
});
