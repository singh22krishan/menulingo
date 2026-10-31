import './globals.css';import Link from 'next/link';
export const metadata={title:'MenuLingo',description:'Build multilingual restaurant menus and publish them by QR code.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><nav><Link href="/" className="brand">MenuLingo</Link><div><Link href="/builder">Builder</Link></div></nav>{children}</body></html>}
