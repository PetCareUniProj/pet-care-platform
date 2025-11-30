import { getServiceEndpoint } from '@/service-discovery';
import PetShop from "@/app/store/products/PetShop";
import {CartProvider} from "@/app/context/CartContext";

export default function Page() {
    const catalogApiOrigin = getServiceEndpoint("catalog-api") || 'http://localhost:5000';
    const basketApiOrigin = getServiceEndpoint("basket-api") || 'http://localhost:5001';

    return(
        <CartProvider basketApiUrl={basketApiOrigin}>
            <PetShop basketApiUrl={basketApiOrigin} catalogApiUrl={catalogApiOrigin} />
        </CartProvider>
    );
}
