# aimock

AIMock is a service built on Node.js and Express.js designed to emulate the behavior of OpenAI's APIs. It can receive
API requests and return mock responses for chat completions, text generation, and image generation. This service is
perfect for development and testing when actual AI-generated results are not required.

## Installation

Run with npx:

```bash
npx aimock
```

Install in your project:

```bash
npm install aimock
# or
yarn add aimock
```

Install globally:

```bash
npm install -g aimock
```

## Getting Started

You can set environment variables in a `.env` file to specify configurations for the service. The following environment
variables are available:

- `MOCK_PORT`: The port for the service, default is 5001
- `MOCK_TYPE`: The type of mock responses, options are `"random"`, `"echo"`, or `"fixed"`, default is `"random"`
- `MOCK_FILE`: The path to a text file for randomly generating response content, default is `"data/contents.txt"`
- `MOCK_FILE_SEPARATOR`: The separator for different response contents in the text file, default is the newline
  character (`"\n"`)

After the service is started, you will see the following output on the console:

```
Server is running at http://localhost:5001
```

You can visit `http://localhost:5001` to verify that the service is running. If the service is working correctly, you
will see the greeting message: "Hello World! This is OpenAI Mock Server."

## Usage

AIMock Server provides the following main routes:

1. `/v1/chat/completions` - Mocks the chat model completions of OpenAI. Supports both stream and non-stream mode.
   Accepts POST requests.

2. `/v1/completions` - Mocks the text model completions of OpenAI. Supports both stream and non-stream mode. Accepts
   POST requests.

3. `/v1/images/generations` - Mocks the image generation of OpenAI. Accepts POST requests.

You can provide a `mockType` parameter in the request body to specify the type of mock response. Acceptable `mockType`
values are `"random"`, `"echo"`, or `"fixed"`. The default is `"random"`.

For more detailed API documentation and examples, please refer to the `/docs` directory in the project.

## Contribution

If you find any issues or have any suggestions, feel free to open an issue or submit a pull request.

## Credits

This project is inspired by [MockAI](https://github.com/polly3d/mockai)

## License

This project is licensed under the MIT license. For more details, please refer to the `LICENSE` file.
