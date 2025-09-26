import AdminLayout from '@/components/admin/AdminLayout'

export const metadata = {
    title: 'MiniMart. - Admin',
    description: 'MiniMart. - Admin',
}

export default function RootAdminLayout({ children }) {
    return (
        <>
            <AdminLayout>{children}</AdminLayout>
        </>
    )
}
