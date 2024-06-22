'use server'

export  async function createCompletion(prompt:string){
    if(!prompt){
        return {error:'Prompt is required'}
    }
}