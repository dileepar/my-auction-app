import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Protect all routes under /dashboard and /auctions/create
      const protectedPaths = ['/dashboard', '/auctions/create'];
      const isProtectedPath = protectedPaths.some(path => 
        req.nextUrl.pathname.startsWith(path)
      );
      
      return isProtectedPath ? !!token : true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/auctions/create'],
}; 