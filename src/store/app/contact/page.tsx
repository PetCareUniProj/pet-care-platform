import {PetShopContact} from "@/app/contact/PetShopContact";
import {CartProvider} from "@/app/context/CartContext";

export default function Page() {
    const catalogApiOrigin = '/api/storefront/catalog';
    const basketApiOrigin = '/api/storefront/basket';

    return(
        <CartProvider basketApiUrl={basketApiOrigin} catalogApiUrl={catalogApiOrigin}>
            <PetShopContact catalogApiUrl={catalogApiOrigin} basketApiUrl={basketApiOrigin} />
        </CartProvider>
    );
}
