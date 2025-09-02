let address
if (process.env.NODE_ENV === 'production') {
    address = import.meta.env.VITE_ADDRESS
} else {
    address = import.meta.env.VITE_DEV_ADDRESS
}
export default address