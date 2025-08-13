import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { undefined } from "zod";
import AWS from 'aws-sdk';
import QRCode from 'qrcode';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      institutionId,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiqrCode,
      email,
      password,
    } = body;

    if (
      !institutionId ||
      !accountHolder ||
      !accountNumber ||
      !ifscCode ||
      !bankName ||
      !branchName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
AWS.config.update({
  accessKeyId: "AKIA3ISJV5CFV32HVXFR",
  secretAccessKey: "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",
  region: "eu-north-1"
});

const s3 = new AWS.S3();

/**
 * @param {string} vpa The Virtual Payment Address.
 * @param {string} name The recipient's name.
 * @param {string} [note=''] An optional transaction note.
 * @param {number} [amount] An optional transaction amount.
 * @returns {string} The formatted and robust UPI URI string.
 */
function createUpiUri(vpa: string, name: string | number | boolean, note = '', amount: null) {
  const encodedName = encodeURIComponent(name);
  const encodedNote = encodeURIComponent(note);

  const merchantCode = '0000'; 
  const transactionRef = 'TRF' + Date.now().toString() + Math.floor(Math.random() * 1000000000);
  let uri = `upi://pay?pa=${vpa}&pn=${encodedName}&mc=${merchantCode}&tr=${transactionRef}&cu=INR`;
  if (note) {
    uri += `&tn=${encodedNote}`;
  }

  if (amount) {
    uri += `&am=${amount}`;
  }

  return uri;
}

/**
 * @param {string} textToEncode The text string (UPI URI) to encode in the QR code.
 * @param {string} logoUrl The URL of the logo image to embed.
 * @param {string} bucketName The name of the S3 bucket.
 * @param {string} key The desired filename for the QR code in S3.
 * @returns {Promise<string>} The public URL of the uploaded QR code.
 */
async function generateAndUploadQRCodeWithLogo(textToEncode: any, logoUrl: string | Request | URL, bucketName: any, key: any) {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(textToEncode, {
      errorCorrectionLevel: 'H'
    });

    const logoResponse = await fetch(logoUrl);
    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
    const qrMetadata = await sharp(qrCodeBuffer).metadata();
    const qrWidth = qrMetadata.width;
    const qrHeight = qrMetadata.height;

    const logoSize = Math.floor(qrWidth * 0.2);
    const resizedLogoBuffer = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain' }) 
      .toBuffer();

    const logoMetadata = await sharp(resizedLogoBuffer).metadata();
    const finalImageBuffer = await sharp(qrCodeBuffer)
      .composite([{
        input: resizedLogoBuffer,
        left: Math.floor((qrWidth - logoMetadata.width) / 2),
        top: Math.floor((qrHeight - logoMetadata.height) / 2)
      }])
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: finalImageBuffer,
      ContentType: 'image/png'
    };
    const data = await s3.upload(params).promise();

    console.log('Branded UPI QR code uploaded successfully:', data.Location);
    return data.Location;
  } catch (error) {
    console.error('Error generating and uploading UPI QR code with logo:', error);
    throw error;
  }
}

const staticPaymentDetails = {
  vpa: upiqrCode, 
  name: accountHolder,
  note: 'Payment to merchant'
};

const staticUpiUri = createUpiUri(
  staticPaymentDetails.vpa,
  staticPaymentDetails.name,
  staticPaymentDetails.note,
  null
);

const myBucket = "classroomaiin";
const staticFileName = `upi-static-qrcode-${Date.now()}.png`;
const logoUrl = "https://classroomaiin.s3.eu-north-1.amazonaws.com/uploads/AI%20Classroom%20LOGO%20%281%29.png"; 
console.log("Generating static QR code with logo for URI:", staticUpiUri);
const upiurl= await generateAndUploadQRCodeWithLogo(staticUpiUri, logoUrl, myBucket, staticFileName);
const newFees = await prisma.fees.create({
      data: {
        institutionId,
        accountHolder,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        upiqrCode,
        email,
        password,
        upilink:upiurl
      },
    });

    return NextResponse.json(newFees, { status: 201 });
  } catch (error) {
    console.error('Error creating fees:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId') as string;

    const instituteFeeDetail = await prisma.fees.findUnique({
      where: {
        institutionId: institutionId
      }
    })

    if (!instituteFeeDetail) {
      return NextResponse.json({ error: "Institute fee detail not found." }, { status: 404 });
    }

    return NextResponse.json(instituteFeeDetail, { status: 200 });
  } catch (e: any) {
    console.log("Error in GET: ", e.message);

    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiqrCode,
    } = body;

    if (
      !id ||
      !accountHolder ||
      !accountNumber ||
      !ifscCode ||
      !bankName ||
      !branchName
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
AWS.config.update({
  accessKeyId: "AKIA3ISJV5CFV32HVXFR",
  secretAccessKey: "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",
  region: "eu-north-1"
});

const s3 = new AWS.S3();

/**
 * @param {string} vpa The Virtual Payment Address.
 * @param {string} name The recipient's name.
 * @param {string} [note=''] An optional transaction note.
 * @param {number} [amount] An optional transaction amount.
 * @returns {string} The formatted and robust UPI URI string.
 */
function createUpiUri(vpa: string, name: string | number | boolean, note = '', amount: null) {
  const encodedName = encodeURIComponent(name);
  const encodedNote = encodeURIComponent(note);

  const merchantCode = '0000'; 
  const transactionRef = 'TRF' + Date.now().toString() + Math.floor(Math.random() * 1000000000);
  let uri = `upi://pay?pa=${vpa}&pn=${encodedName}&mc=${merchantCode}&tr=${transactionRef}&cu=INR`;
  if (note) {
    uri += `&tn=${encodedNote}`;
  }

  if (amount) {
    uri += `&am=${amount}`;
  }

  return uri;
}

/**
 * @param {string} textToEncode The text string (UPI URI) to encode in the QR code.
 * @param {string} logoUrl The URL of the logo image to embed.
 * @param {string} bucketName The name of the S3 bucket.
 * @param {string} key The desired filename for the QR code in S3.
 * @returns {Promise<string>} The public URL of the uploaded QR code.
 */
async function generateAndUploadQRCodeWithLogo(textToEncode: any, logoUrl: string | Request | URL, bucketName: any, key: any) {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(textToEncode, {
      errorCorrectionLevel: 'H'
    });

    const logoResponse = await fetch(logoUrl);
    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
    const qrMetadata = await sharp(qrCodeBuffer).metadata();
    const qrWidth = qrMetadata.width;
    const qrHeight = qrMetadata.height;

    const logoSize = Math.floor(qrWidth * 0.2);
    const resizedLogoBuffer = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain' }) 
      .toBuffer();

    const logoMetadata = await sharp(resizedLogoBuffer).metadata();
    const finalImageBuffer = await sharp(qrCodeBuffer)
      .composite([{
        input: resizedLogoBuffer,
        left: Math.floor((qrWidth - logoMetadata.width) / 2),
        top: Math.floor((qrHeight - logoMetadata.height) / 2)
      }])
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: finalImageBuffer,
      ContentType: 'image/png'
    };
    const data = await s3.upload(params).promise();

    console.log('Branded UPI QR code uploaded successfully:', data.Location);
    return data.Location;
  } catch (error) {
    console.error('Error generating and uploading UPI QR code with logo:', error);
    throw error;
  }
}

const staticPaymentDetails = {
  vpa: upiqrCode, 
  name: accountHolder,
  note: 'Payment to merchant'
};

const staticUpiUri = createUpiUri(
  staticPaymentDetails.vpa,
  staticPaymentDetails.name,
  staticPaymentDetails.note,
  null
);

const myBucket = "classroomaiin";
const staticFileName = `upi-static-qrcode-${Date.now()}.png`;

const logoUrl = "https://classroomaiin.s3.eu-north-1.amazonaws.com/uploads/AI%20Classroom%20LOGO%20%281%29.png"; 
console.log("Generating static QR code with logo for URI:", staticUpiUri);
const upiurl= await generateAndUploadQRCodeWithLogo(staticUpiUri, logoUrl, myBucket, staticFileName);
    const updatedFeesDetail = await prisma.fees.update({
      where: {
        id: id
      },
      data: {
        accountHolder,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        upiqrCode,
        upilink: upiurl
      }
    })

    console.log("Updated Fees Detail: ", updatedFeesDetail);

    return NextResponse.json(updatedFeesDetail, { status: 200 });


  } catch (e: any) {

    console.error("Error in PATCH: ", e);

    return NextResponse.json({
      error: "An internal server error occurred."
    }, { status: 500 })
  }
}

// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const institutionId = searchParams.get('institutionId') as string;

//     const instituteFeeDetail = await prisma.fees.delete({
//       where: {
//         id: institutionId
//       }
//     })

//     if (!instituteFeeDetail) {
//       return NextResponse.json({ error: "Institute fee detail not found." }, { status: 404 });
//     }

//     return NextResponse.json(instituteFeeDetail, { status: 200 });
//   } catch (e: any) {
//     console.log("Error in GET: ", e.message);

//     return NextResponse.json(
//       { error: "An internal server error occurred." },
//       { status: 500 }
//     )
//   }
// }