export function messagePipeline(message) {
    let messageSlice = message.slice(0, 6),
        pipeline;

    if (messageSlice === '/giphy') {
        pipeline = {
            isGiphy: true,
            giphyTag: message.slice(7)
        };
    } else {
        pipeline = {
            isGiphy: false,
            giphyTag: ''
        };
    }
    return pipeline;
}