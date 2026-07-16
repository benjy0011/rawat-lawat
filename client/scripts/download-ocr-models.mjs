import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modelDirectory = fileURLToPath(
  new URL("../public/models/", import.meta.url),
);

const models = [
  {
    fileName: "PP-OCRv5_mobile_det_onnx_infer.tar",
    expectedBytes: 4_843_520,
    url: "https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/PP-OCRv5_mobile_det_onnx_infer.tar",
  },
  {
    fileName: "PP-OCRv5_mobile_rec_onnx_infer.tar",
    expectedBytes: 16_701_440,
    url: "https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/PP-OCRv5_mobile_rec_onnx_infer.tar",
  },
];

async function hasCompleteModel(filePath, expectedBytes) {
  try {
    const file = await stat(filePath);
    return file.size === expectedBytes;
  } catch {
    return false;
  }
}

async function downloadModel({ fileName, expectedBytes, url }) {
  const destination = path.join(modelDirectory, fileName);

  if (await hasCompleteModel(destination, expectedBytes)) {
    console.log(`Using existing OCR model: ${fileName}`);
    return;
  }

  const temporaryFile = `${destination}.download`;
  console.log(`Downloading OCR model: ${fileName}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed with HTTP ${response.status}.`);
    }

    const modelData = Buffer.from(await response.arrayBuffer());
    if (modelData.length !== expectedBytes) {
      throw new Error(
        `Expected ${expectedBytes} bytes but received ${modelData.length}.`,
      );
    }

    await writeFile(temporaryFile, modelData);
    await rm(destination, { force: true });
    await rename(temporaryFile, destination);
  } catch (error) {
    await rm(temporaryFile, { force: true });
    throw new Error(`Unable to download ${fileName}.`, { cause: error });
  }
}

await mkdir(modelDirectory, { recursive: true });

for (const model of models) {
  await downloadModel(model);
}
