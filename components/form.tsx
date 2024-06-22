'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function Form() {
  

  return (
    <section className='mx-auto max-w-lg'>
      <Card className='border-0 shadow-none'>
        <CardHeader className='text-center'>
          <CardTitle>Next AI Blogger</CardTitle>
          <CardDescription>Generate a blog post about anything</CardDescription>
        </CardHeader>
        <CardContent>
          <form  className='mt-3'>
            <Input
              name='prompt'
              placeholder='What should I write about?'
              className='rounded-lg'
            />
            <Button size='sm' type='submit' className='mt-3 w-full rounded-lg'>
                Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
