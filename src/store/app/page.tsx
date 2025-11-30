import { HomePage } from "@/app/HomePage";
import {CartProvider} from "@/app/context/CartContext";

export default function Page() {
    const catalogApiOrigin = '/api/storefront/catalog';
    const basketApiUrl = '/api/storefront/basket';

    return (
        <CartProvider basketApiUrl={basketApiUrl} catalogApiUrl={catalogApiOrigin}>
            <HomePage catalogApiUrl={catalogApiOrigin} basketApiUrl={basketApiUrl} />
        </CartProvider>
    );
}
