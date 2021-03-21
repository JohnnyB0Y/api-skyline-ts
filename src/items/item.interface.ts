
//  item.interface.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

export interface BaseItem {
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface Item extends BaseItem {
  id: number;
}
