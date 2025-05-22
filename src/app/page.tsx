import { getPosts } from '@/actions/post.action';
import { getDBUserId } from '@/actions/user.action';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import SuggestedUsers from '@/components/SuggestedUsers';
import { currentUser } from '@clerk/nextjs/server';

const Home = async () => {
  const user = await currentUser() 

  const posts = await getPosts()

  const dbUserId = await getDBUserId()

  console.log('posts', posts)
  
  return (
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
      <div className='lg:col-span-6'>
        {user? <CreatePost />: <></>}

        <div className='space-y-6'>
          {posts.map((post, index) => (
            <PostCard key={index} post={post} dbUserId={dbUserId}/>
          ))}
        </div>
      </div>

      <div className='lg:block hidden lg:col-span-4 sticky top-20'>
        <SuggestedUsers/>
      </div>
    </div>
  );
}

export default Home