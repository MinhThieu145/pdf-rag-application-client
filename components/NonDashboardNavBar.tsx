import React from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'


const NonDashboardNavBar = () => {
  return (
    <nav className='nondashboard-navbar'>
        <div className='nondashboard-navbar__container'>
            <div className='nondashboard-navbar__search'>
            <Link href = '/' className='nondashboard-navbar__brand'>HELLO WORLD</Link>


            <div className='flex items-center gap-4'>
                <div className='relative group flex'>

                <Link href='/search' className='nondashboard-navbar__search-input flex flex-row gap-2'>
                    <BookOpen className='text-sm'/>

                    <span className='hidden sm:inline'>Search Course</span>
                    <span className='sm:hidden'>Search</span>
                </Link>
    
                </div>
            </div>
        </div>

        {/* Sign In buttons  */}
        <div>
        
        </div>

        </div>
        
    </nav>
  )
}

export default NonDashboardNavBar