'use server'

import { supabase } from "@/lib/supabase"
import OpenAI from "openai"
import { decode } from 'base64-arraybuffer'


const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY})

export  async function createCompletion(prompt:string){
    if(!prompt){
        return {error:'Prompt is required'}
    }

    // genrate blog post using openAi

    const messages: any = [
        {
          role: 'user',
          content: `Write a blog post around 200 words about the following topic: "${prompt}" in markdown format.`
        }
      ]

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages
      })

    const content = completion?.choices?.[0].message?.content

    if(!content){
        return {error :"Unable to generate the blog content."}
    }

    // genrate an image using openAi

    const image= await openai.images.generate({
        model:"dall-e-3",
        prompt:`Generate an image for a blog post about "${prompt}"`,
        n:1,
        size:'1792x1024',
        response_format:'b64_json'
    })

    const imageName = `blog-${Date.now()}`
    const imageData = image?.data?.[0]?.b64_json as string

    if(!imageData){
        return {error:'Unable to genrate the blog image'}
    }

    
    // Upload the image to supabase storage

    const {data,error} = await supabase.storage.from('blogs').upload(imageName,decode(imageData),{
        contentType:'image/png'
    })

    if(error){
        return { error: 'Unable to upload the blog image to Storage.' }
    }

    const path = data?.path
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/blogs/${path}`

    // create a new blog post in supabase
    const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .insert([{ title: prompt, content, imageUrl, userId:"1234" }])
    .select()

    if (blogError) {
        console.log("blogError : ",blogError);
        
        return { error: 'Unable to insert the blog into the database.' }
      }

    console.log(blog);
    

}








