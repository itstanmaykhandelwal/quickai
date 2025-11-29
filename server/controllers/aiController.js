// import OpenAI from "openai";
// import { clerkClient } from "@clerk/express";
// import sql from "../configs/db.js";
// import { v2 as cloudinary } from "cloudinary";
// import axios from "axios";
// import fs from 'fs'
// // import pdf from 'pdf-parse/lib/pdf-parse.js'
// import pdf from 'pdf-parse'


// const AI = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

// export const generateArticle = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { prompt, length } = req.body;
//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== "premium" && free_usage >= 10) {
//             return res.json({
//                 success: false,
//                 message: "Limit reached. Upgrade to continue.",
//             });
//         }

//         const response = await AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [
//                 {
//                     role: "user",
//                     content: prompt,
//                 },
//             ],
//             temperature: 0.7,
//             max_tokens: length,
//         });

//         const content = response.choices[0].message.content;

//         await sql` INSERT INTO creations (user_id, prompt, content, type) 
//         VALUES (${userId}, ${prompt}, ${content}, 'article')`;

//         if (plan !== "premium") {
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1,
//                 },
//             });
//         }

//         res.json({ success: true, content });
//     } catch (error) {
//         console.log(error.message);
//         res.json({ success: false, message: error.message });
//     }
// };

// export const generateBlogTitle = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { prompt } = req.body;
//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== "premium" && free_usage >= 10) {
//             return res.json({
//                 success: false,
//                 message: "Limit reached. Upgrade to continue.",
//             });
//         }

//         const response = await AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [
//                 {
//                     role: "user",
//                     content: prompt,
//                 },
//             ],
//             temperature: 0.7,
//             max_tokens: 100,
//         });

//         const content = response.choices[0].message.content;

//         await sql` INSERT INTO creations (user_id, prompt, content, type) 
//         VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

//         if (plan !== "premium") {
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1,
//                 },
//             });
//         }

//         res.json({ success: true, content });
//     } catch (error) {
//         console.log(error.message);
//         res.json({ success: false, message: error.message });
//     }
// };

// export const generateImage = async (req, res)=>{
//     try {
//         const { userId } = req.auth();
//         const { prompt, publish } = req.body;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({ success: false, message: "This feature is only available for premium subscriptions"})
//         }

        
//         const formData = new FormData()
//         formData.append('prompt', prompt)
//         const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
//             headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
//             responseType: "arraybuffer",
//         })

//         const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

//         const {secure_url} = await cloudinary.uploader.upload(base64Image)
        

//         await sql` INSERT INTO creations (user_id, prompt, content, type, publish) 
//         VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false })`;

//         res.json({ success: true, content: secure_url})

//     } catch (error) {
//         console.log(error.message)
//         res.json({success: false, message: error.message})
//     }
// }

// export const removeImageBackground = async (req, res)=>{
//     try {
//         const { userId } = req.auth();
//         const image = req.file;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({ success: false, message: "This feature is only available for premium subscriptions"})
//         }

//         const {secure_url} = await cloudinary.uploader.upload(image.path, {
//             transformation: [
//                 {
//                     effect: 'background_removal',
//                     background_removal: 'remove_the_background'
//                 }
//             ]
//         })

//         await sql` INSERT INTO creations (user_id, prompt, content, type) 
//         VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

//         res.json({ success: true, content: secure_url})

//     } catch (error) {
//         console.log(error.message)
//         res.json({success: false, message: error.message})
//     }
// }

// export const removeImageObject = async (req, res)=>{
//     try {
//         const { userId } = req.auth();
//         const { object } = req.body;
//         const image = req.file;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({ success: false, message: "This feature is only available for premium subscriptions"})
//         }

//         const {public_id} = await cloudinary.uploader.upload(image.path)

//         const imageUrl = cloudinary.url(public_id, {
//             transformation: [{effect: `gen_remove:${object}`}],
//             resource_type: 'image'
//         })

//         await sql` INSERT INTO creations (user_id, prompt, content, type) 
//         VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

//         res.json({ success: true, content: imageUrl})

//     } catch (error) {
//         console.log(error.message)
//         res.json({success: false, message: error.message})
//     }
// }

// export const resumeReview = async (req, res)=>{
//     try {
//         const { userId } = req.auth();
//         const resume = req.file;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({ success: false, message: "This feature is only available for premium subscriptions"})
//         }

//         if(resume.size > 5 * 1024 * 1024){
//             return res.json({success: false, message: "Resume file size exceeds allowed size (5MB)."})
//         }

//         const dataBuffer = fs.readFileSync(resume.path)
//         const pdfData = await pdf(dataBuffer)

//         const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

//        const response = await AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [{ role: "user", content: prompt, } ],
//             temperature: 0.7,
//             max_tokens: 1000,
//         });

//         const content = response.choices[0].message.content

//         await sql` INSERT INTO creations (user_id, prompt, content, type) 
//         VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

//         res.json({ success: true, content})

//     } catch (error) {
//         console.log(error.message)
//         res.json({success: false, message: error.message})
//     }
// }


// aiController.js
import OpenAI from "openai";
import { clerkClient } from "@clerk/express";
import sql from "../configs/db.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// CommonJS modules via createRequire for compatibility
const pdf = require("pdf-parse");
const FormData = require("form-data");

/**
 * NOTES:
 * - Ensure cloudinary.config(...) is set somewhere in your app (or set it here).
 * - Ensure multer (or any upload middleware) is saving files at `req.file.path`.
 * - Ensure process.env variables:
 *    GEMINI_API_KEY, CLIPDROP_API_KEY, CLOUDINARY_* (if used), etc.
 */

// Example: if you haven't configured cloudinary elsewhere, uncomment and set env vars.
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices?.[0]?.message?.content ?? "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      // update user's private metadata free_usage
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("generateArticle error:", error);
    res.json({ success: false, message: error.message ?? "Something went wrong" });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices?.[0]?.message?.content ?? "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("generateBlogTitle error:", error);
    res.json({ success: false, message: error.message ?? "Something went wrong" });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    // Use form-data package to build multipart body
    const form = new FormData();
    form.append("prompt", prompt);

    const clipdropKey = process.env.CLIPDROP_API_KEY;
    if (!clipdropKey) {
      return res.json({ success: false, message: "Clipdrop API key not configured" });
    }

    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", form, {
      headers: {
        ...form.getHeaders(),
        "x-api-key": clipdropKey,
      },
      responseType: "arraybuffer",
      maxBodyLength: Infinity,
    });

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image);
    const secure_url = uploadResult.secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("generateImage error:", error);
    res.json({ success: false, message: error.message ?? "Something went wrong" });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    if (!image || !image.path) {
      return res.json({ success: false, message: "No image uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(image.path, {
      // Cloudinary background removal effect - make sure your account supports this
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    const secure_url = uploadResult.secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    // Optionally delete temp file
    try { fs.unlinkSync(image.path); } catch (e) { /* ignore */ }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("removeImageBackground error:", error);
    res.json({ success: false, message: error.message ?? "Something went wrong" });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    if (!image || !image.path) {
      return res.json({ success: false, message: "No image uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(image.path);
    const public_id = uploadResult.public_id;

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    try { fs.unlinkSync(image.path); } catch (e) { /* ignore */ }

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.error("removeImageObject error:", error);
    res.json({ success: false, message: error.message ?? "Something went wrong" });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    if (!resume || !resume.path) {
      return res.json({ success: false, message: "No resume uploaded" });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." });
    }

    // read file buffer
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer); // pdf-parse returns { text, info, metadata, version }

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices?.[0]?.message?.content ?? "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    // cleanup uploaded resume
    try { fs.unlinkSync(resume.path); } catch (e) { /* ignore */ }

    res.json({ success: true, content });
  } catch (error) {
    console.error("resumeReview error:", error);
    res.json({ success: false, message: error.message ?? "Something went wrong" });
  }
};
