export interface BasketItem {
    product_id: number;
    quantity: number;
    name?: string;
    price?: number;
    pictureFileName?: string;
}

export interface CustomerBasket {
    items: BasketItem[];
}

interface BasketClientOptions {
    resourcePath?: string;
}

class BasketClient {
    private readonly endpoint: string;

    constructor(baseUrl: string = '', options?: BasketClientOptions) {
        const normalizedBase = (baseUrl || process.env.NEXT_PUBLIC_BASKET_API_URL || '').replace(/\/+$/, '');
        const resourcePath = options?.resourcePath ?? '/api/basket';
        this.endpoint = resourcePath
            ? `${normalizedBase}${resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`}` || '/api/basket'
            : normalizedBase || '/api/basket';
    }

    /**
     * Get the current basket for the user
     */
    async getBasket(): Promise<CustomerBasket> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { items: [] };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching basket:', error);
            return { items: [] };
        }
    }

    /**
     * Add an item to the basket
     */
    async addItem(productId: number, quantity: number = 1): Promise<CustomerBasket> {
        try {
            const basket = await this.getBasket();
            const existingItem = basket.items.find(item => item.product_id === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                basket.items.push({ product_id: productId, quantity });
            }

            return this.updateBasket(basket.items);
        } catch (error) {
            console.error('Error adding item to basket:', error);
            throw error;
        }
    }

    /**
     * Remove an item from the basket
     */
    async removeItem(productId: number): Promise<CustomerBasket> {
        try {
            const basket = await this.getBasket();
            basket.items = basket.items.filter(item => item.product_id !== productId);
            return this.updateBasket(basket.items);
        } catch (error) {
            console.error('Error removing item from basket:', error);
            throw error;
        }
    }

    /**
     * Update the basket with new items
     */
    async updateBasket(items: BasketItem[]): Promise<CustomerBasket> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating basket:', error);
            throw error;
        }
    }

    /**
     * Clear the basket
     */
    async clearBasket(): Promise<void> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error clearing basket:', error);
            throw error;
        }
    }

    /**
     * Get the total number of items in the basket
     */
    async getItemCount(): Promise<number> {
        try {
            const basket = await this.getBasket();
            return basket.items.reduce((sum, item) => sum + item.quantity, 0);
        } catch (error) {
            console.error('Error getting item count:', error);
            return 0;
        }
    }
}

export default BasketClient;

