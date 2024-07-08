'use server'

import { supabase } from "@/lib/supabase"
import OpenAI from "openai"
import { decode } from 'base64-arraybuffer'
import { redirect } from "next/navigation"


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function createCompletion(prompt: string) {
    if (!prompt) {
        return { error: 'Prompt is required' }
    }

    
    // Generate blog post using OpenAI
    const messages = [
        {
            role: 'user',
            content: `Write a blog post around 200 words about the following topic: "${prompt}" in markdown format.`
        }
    ]

    const completion = await openai.chat.completions.create({
        model:"gpt-4o-2024-05-13",
        messages,
        
    
    })

    const content = completion?.choices?.[0].message?.content
    if (!content) {
        return { error: "Unable to generate the blog content." }
    }

    // Generate an image using OpenAI
    const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Generate an image for a blog post about "${prompt}"`,
        n: 1,
        size: '1792x1024',
        response_format: 'b64_json'
    })

    const imageName = `blog-${Date.now()}`
    const imageData = image?.data?.[0]?.b64_json as string
    if (!imageData) {
        return { error: 'Unable to generate the blog image' }
    }

    // Upload the image to Supabase storage
    const { data: storageData, error: storageError } = await supabase.storage.from('blogs').upload(imageName, decode(imageData), {
        contentType: 'image/png'
    })

    if (storageError) {
        console.error("Unable to upload the blog image to Storage ERROR", storageError);
        return { error: 'Unable to upload the blog image to Storage.' }
    }

    const path = storageData?.path
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/blogs/${path}`

    // Create a new blog post in Supabase

    const { data: blog, error: blogError } = await supabase
        .from('blogs')
        .insert([{ title: prompt, content, imageUrl, userId: "1236" }])
        .select()

    if (blogError) {
        console.error("Unable to insert the blog into the database ERROR", blogError);
        return { error: 'Unable to insert the blog into the database.' }
    }

    console.log(blog);
    
    const blogId = blog?.[0].id

    redirect(`/blog/${blogId}`)
    
}
