'use server'

import { supabase } from "@/lib/supabase"
import OpenAI from "openai"
import { decode } from 'base64-arraybuffer'
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from '@clerk/nextjs/server'


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function createCompletion(prompt: string) {
    if (!prompt) {
        return { error: 'Prompt is required' }
    }

    // check user loginIn or Not

    const {userId} = auth()
    if(!userId){
        return {error: 'user is not loggedIn'}
    }

    
    // Generate blog post using OpenAI
    const messages = [
        {
            role: 'user',
            content:    `
            Write a blog post around 200 words about the following topic: "${prompt}" in markdown format.
  
          The blog post should be structured as follows:
  
          1. **Title**: A compelling and attention-grabbing title.
          2. **Introduction**: A brief introduction to the topic that hooks the reader.
          3. **Section 1: Heading**: A main heading for the first section.
              - **Subheading 1.1**: A subheading under the first section.
                  - **Paragraph**: A detailed paragraph explaining Subheading 1.1 with relevant examples or insights.
              - **Subheading 1.2**: Another subheading under the first section.
                  - **Paragraph**: A detailed paragraph explaining Subheading 1.2 with relevant examples or insights.
          4. **Section 2: Heading**: A main heading for the second section.
              - **Subheading 2.1**: A subheading under the second section.
                  - **Paragraph**: A detailed paragraph explaining Subheading 2.1 with relevant examples or insights.
              - **Subheading 2.2**: Another subheading under the second section.
                  - **Paragraph**: A detailed paragraph explaining Subheading 2.2 with relevant examples or insights.
          5. **Conclusion**: Summarize the main points of the blog post and provide a closing thought or call to action.
  
          The writing style should be engaging, informative, and similar to blog posts found on daily.dev and Medium. Use clear headings and subheadings, and ensure the content is well-researched and relevant.
  
          Topic: "${prompt}"
          `
         
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
        .insert([{ title: prompt, content, imageUrl, userId: userId }])
        .select()

    if (blogError) {
        console.error("Unable to insert the blog into the database ERROR", blogError);
        return { error: 'Unable to insert the blog into the database.' }
    }

    console.log(blog);
    
    const blogId = blog?.[0].id

    revalidatePath('/')
    redirect(`/blog/${blogId}`)
    
}
