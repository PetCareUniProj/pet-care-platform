import { getServiceEndpoint } from '@/service-discovery';
import { HomePage } from "@/app/HomePage";
import {CartProvider} from "@/app/context/CartContext";

export default function Page() {
    const catalogApiOrigin = getServiceEndpoint("catalog-api") || 'http://localhost:5000';
    const basketApiUrl = getServiceEndpoint("basket-api") || 'http://localhost:5001';

    return (
        <CartProvider basketApiUrl={basketApiUrl} catalogApiUrl={catalogApiOrigin}>
            <HomePage catalogApiUrl={catalogApiOrigin} basketApiUrl={basketApiUrl} />
        </CartProvider>
    );
}
