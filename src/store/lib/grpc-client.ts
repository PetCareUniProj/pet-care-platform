import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {getServiceEndpoint} from "@/service-discovery";

const PROTO_PATH = path.join(process.cwd(), 'proto', 'basket.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const BasketApi = (protoDescriptor.BasketApi as any);

const client = new BasketApi.Basket(
    getServiceEndpoint("basket-api"),
    grpc.credentials.createInsecure()
);

export const basketService = {
    getBasket: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            client.GetBasket({}, (error: any, response: any) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    },

    updateBasket: (items: any[]): Promise<any> => {
        return new Promise((resolve, reject) => {
            client.UpdateBasket({ items }, (error: any, response: any) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    },

    deleteBasket: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            client.DeleteBasket({}, (error: any, response: any) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    },
};
