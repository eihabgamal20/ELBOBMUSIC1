"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSpeechWithWitai = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * There is an issue with wit.ai response from /speech endpoint, which returns multiple root objects. You can check the docs here: https://wit.ai/docs/http/20210928/#post__speech_link
 * This function converts response text to valid json by wrapping it in array and fixing commas.
 * @param text
 * @returns
 */
const formatWitaiResponse = (text) => {
    const fixedCommas = text.replaceAll("\n}\r\n", "},");
    const wrappedInArray = `[${fixedCommas}]`;
    return JSON.parse(wrappedInArray);
};
function extractSpeechText(key, audioBuffer, contenttype) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, node_fetch_1.default)("https://api.wit.ai/speech", {
            method: "post",
            body: audioBuffer,
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-type": contenttype,
            },
        });
        if (response.status !== 200)
            throw new Error(`Api error, code: ${response.status}`);
        const data = formatWitaiResponse(yield response.text());
        const latestMessage = data.at(-1);
        if (!latestMessage)
            throw new Error(`Invalid API response`);
        return latestMessage;
    });
}
function resolveSpeechWithWitai(audioBuffer, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = options === null || options === void 0 ? void 0 : options.key;
        if (!key)
            throw new Error("wit.ai API key wasn't specified.");
        const contenttype = "audio/raw;encoding=signed-integer;bits=16;rate=48k;endian=little";
        const output = yield extractSpeechText(key, audioBuffer, contenttype);
        return output.text;
    });
}
exports.resolveSpeechWithWitai = resolveSpeechWithWitai;
//# sourceMappingURL=witai.js.map