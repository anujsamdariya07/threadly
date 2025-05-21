import CreatePost from '@/components/CreatePost';
import ModeToggle from '@/components/ModeToggle';
import { currentUser } from '@clerk/nextjs/server';

const Home = async () => {
  const user = await currentUser() 
  
  return (
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
      <div className='lg:col-span-6'>
        {user? <CreatePost />: <></>}
      </div>

      <div className='lg:block hidden lg:col-span-4 sticky top-20'>
        WhoToFollow
      </div>
    </div>
  );
}

export default Home