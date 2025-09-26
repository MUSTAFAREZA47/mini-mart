import StoreLayout from '@/components/store/StoreLayout'

export const metadata = {
    title: 'MiniMart. - Store Dashboard',
    description: 'MiniMart. - Store Dashboard',
}

export default function RootAdminLayout({ children }) {
    return (
        <>
            <StoreLayout>{children}</StoreLayout>
        </>
    )
}
