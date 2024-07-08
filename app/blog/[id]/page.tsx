import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getBlogById } from '@/lib/supabase'
import { ChevronLeft } from 'lucide-react'

export default async function Blog({ params }: { params: { id: string } }) {
  const { content, imageUrl } = await getBlogById(Number(params.id))

  return (
    <section className='py-12'>
      <div className='container max-w-3xl'>
        <Link
          href='/'
          className='-ml-2 inline-flex items-center text-sm font-light text-gray-500 no-underline hover:text-gray-700'
        >
          <ChevronLeft strokeWidth={1} size={20} />
          <span>Go back</span>
        </Link>

        <section className='prose prose-neutral md:prose-lg lg:prose-xl max-w-none'>
          <Image alt='' src={imageUrl} width={1792} height={1024} />
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </section>
      </div>
    </section>
  )
}
