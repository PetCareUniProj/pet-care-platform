import { getServiceEndpoint } from '@/service-discovery';
import {PetShopContact} from "@/app/contact/PetShopContact";
import {CartProvider} from "@/app/context/CartContext";

export default function Page() {
    const catalogApiOrigin = getServiceEndpoint("catalog-api") || 'http://localhost:5000';
    const basketApiOrigin = getServiceEndpoint("basket-api") || 'http://localhost:5001';

    return(
        <CartProvider>
            <PetShopContact catalogApiUrl={catalogApiOrigin} basketApiUrl={basketApiOrigin} />;
        </CartProvider>
    );
}
