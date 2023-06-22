import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJSLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({ d: z.array(z.number()), e: z.number(), s: z.number(), toFixed: z.function().args().returns(z.string()), });

export const DecimalJSLikeListSchema: z.ZodType<Prisma.DecimalJsLike[]> = z.object({ d: z.array(z.number()), e: z.number(), s: z.number(), toFixed: z.function().args().returns(z.string()), }).array();

export const DECIMAL_STRING_REGEX = /^[0-9.,e+-bxffo_cp]+$|Infinity|NaN/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const RoomScalarFieldEnumSchema = z.enum(['id','roomNumber','roomName','roomType','status','capacity','dailyRateUSD']);

export const RoomImageScalarFieldEnumSchema = z.enum(['id','fileUrl','fileKey']);

export const RoomImageRelationScalarFieldEnumSchema = z.enum(['id','roomId','roomImageId']);

export const GuestScalarFieldEnumSchema = z.enum(['id','firstName','surname','fullName','email','currentReservationId','type']);

export const ReservationScalarFieldEnumSchema = z.enum(['id','guestId','userId','roomId','roomType','checkIn','checkOut','status','createdAt','updatedAt','guestName','guestEmail','subTotalUSD','paymentStatus']);

export const TaskScalarFieldEnumSchema = z.enum(['id','shortDesc','description','type','roomId','location']);

export const ItemScalarFieldEnumSchema = z.enum(['id','name','priceUSD','happyHourPriceUSD','category','quantityInStock','quantityUnit']);

export const ItemIngredientScalarFieldEnumSchema = z.enum(['id','name','ingredientId','quantity','quantityUnit']);

export const OrderScalarFieldEnumSchema = z.enum(['id','userId','guestId','name','email','status','reservationId','subTotalUSD','happyHour','createdAt']);

export const ItemOrdersScalarFieldEnumSchema = z.enum(['id','itemId','orderId','quantity']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullsOrderSchema = z.enum(['first','last']);

export const OrderStatusSchema = z.enum(['PAID','UNPAID']);

export type OrderStatusType = `${z.infer<typeof OrderStatusSchema>}`

export const ReservationStatusSchema = z.enum(['CONFIRMED','CHECKED_IN','FINAL_BILL','CHECKED_OUT']);

export type ReservationStatusType = `${z.infer<typeof ReservationStatusSchema>}`

export const ItemCategorySchema = z.enum(['SOFT_DRINKS','BEER','WINE','SPIRITS','PREMIUM_SPIRITS','COCKTAILS','SNACKS','FOOD','ENTERTAINMENT','INGREDIENT']);

export type ItemCategoryType = `${z.infer<typeof ItemCategorySchema>}`

export const RoomTypeSchema = z.enum(['STANDARD','SUPERIOR','DELUXE']);

export type RoomTypeType = `${z.infer<typeof RoomTypeSchema>}`

export const GuestTypeSchema = z.enum(['HOTEL','OUTSIDE','STAFF']);

export type GuestTypeType = `${z.infer<typeof GuestTypeSchema>}`

export const RoomStatusSchema = z.enum(['OCCUPIED','VACANT','MAINTENANCE']);

export type RoomStatusType = `${z.infer<typeof RoomStatusSchema>}`

export const PaymentStatusSchema = z.enum(['PAID','UNPAID']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

export const TaskTypeSchema = z.enum(['ISSUE','TASK']);

export type TaskTypeType = `${z.infer<typeof TaskTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ROOM SCHEMA
/////////////////////////////////////////

export const RoomSchema = z.object({
  roomType: RoomTypeSchema,
  status: RoomStatusSchema,
  id: z.string().cuid(),
  roomNumber: z.string(),
  roomName: z.string().nullable(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'dailyRateUSD' must be a Decimal. Location: ['Models', 'Room']",  }),
})

export type Room = z.infer<typeof RoomSchema>

/////////////////////////////////////////
// ROOM IMAGE SCHEMA
/////////////////////////////////////////

export const RoomImageSchema = z.object({
  id: z.string().cuid(),
  fileUrl: z.string(),
  fileKey: z.string(),
})

export type RoomImage = z.infer<typeof RoomImageSchema>

/////////////////////////////////////////
// ROOM IMAGE RELATION SCHEMA
/////////////////////////////////////////

export const RoomImageRelationSchema = z.object({
  id: z.string().cuid(),
  roomId: z.string(),
  roomImageId: z.string(),
})

export type RoomImageRelation = z.infer<typeof RoomImageRelationSchema>

/////////////////////////////////////////
// GUEST SCHEMA
/////////////////////////////////////////

export const GuestSchema = z.object({
  type: GuestTypeSchema,
  id: z.string().cuid(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().nullable(),
  email: z.string(),
  currentReservationId: z.string().nullable(),
})

export type Guest = z.infer<typeof GuestSchema>

/////////////////////////////////////////
// RESERVATION SCHEMA
/////////////////////////////////////////

export const ReservationSchema = z.object({
  roomType: RoomTypeSchema.nullable(),
  status: ReservationStatusSchema,
  paymentStatus: PaymentStatusSchema,
  id: z.string().cuid(),
  guestId: z.string().nullable(),
  userId: z.string().nullable(),
  roomId: z.string().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  guestName: z.string(),
  guestEmail: z.string().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'subTotalUSD' must be a Decimal. Location: ['Models', 'Reservation']",  }).nullable(),
})

export type Reservation = z.infer<typeof ReservationSchema>

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  type: TaskTypeSchema,
  id: z.string().cuid(),
  shortDesc: z.string(),
  description: z.string(),
  roomId: z.string().nullable(),
  location: z.string(),
})

export type Task = z.infer<typeof TaskSchema>

/////////////////////////////////////////
// ITEM SCHEMA
/////////////////////////////////////////

export const ItemSchema = z.object({
  category: ItemCategorySchema,
  id: z.string().cuid(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'priceUSD' must be a Decimal. Location: ['Models', 'Item']",  }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'happyHourPriceUSD' must be a Decimal. Location: ['Models', 'Item']",  }).nullable(),
  quantityInStock: z.number().int(),
  quantityUnit: z.string().nullable(),
})

export type Item = z.infer<typeof ItemSchema>

/////////////////////////////////////////
// ITEM INGREDIENT SCHEMA
/////////////////////////////////////////

export const ItemIngredientSchema = z.object({
  id: z.string().cuid(),
  name: z.string().nullable(),
  ingredientId: z.string().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'ItemIngredient']",  }).nullable(),
  quantityUnit: z.string().nullable(),
})

export type ItemIngredient = z.infer<typeof ItemIngredientSchema>

/////////////////////////////////////////
// ORDER SCHEMA
/////////////////////////////////////////

export const OrderSchema = z.object({
  status: OrderStatusSchema.nullable(),
  id: z.string().cuid(),
  userId: z.string().nullable(),
  guestId: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  reservationId: z.string().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: "Field 'subTotalUSD' must be a Decimal. Location: ['Models', 'Order']",  }),
  happyHour: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Order = z.infer<typeof OrderSchema>

/////////////////////////////////////////
// ITEM ORDERS SCHEMA
/////////////////////////////////////////

export const ItemOrdersSchema = z.object({
  id: z.string().cuid(),
  itemId: z.string(),
  orderId: z.string(),
  quantity: z.number().int(),
})

export type ItemOrders = z.infer<typeof ItemOrdersSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// ROOM
//------------------------------------------------------

export const RoomIncludeSchema: z.ZodType<Prisma.RoomInclude> = z.object({
  reservations: z.union([z.boolean(),z.lazy(() => ReservationFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => RoomImageRelationFindManyArgsSchema)]).optional(),
  tasks: z.union([z.boolean(),z.lazy(() => TaskFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const RoomArgsSchema: z.ZodType<Prisma.RoomArgs> = z.object({
  select: z.lazy(() => RoomSelectSchema).optional(),
  include: z.lazy(() => RoomIncludeSchema).optional(),
}).strict();

export const RoomCountOutputTypeArgsSchema: z.ZodType<Prisma.RoomCountOutputTypeArgs> = z.object({
  select: z.lazy(() => RoomCountOutputTypeSelectSchema).nullish(),
}).strict();

export const RoomCountOutputTypeSelectSchema: z.ZodType<Prisma.RoomCountOutputTypeSelect> = z.object({
  reservations: z.boolean().optional(),
  images: z.boolean().optional(),
  tasks: z.boolean().optional(),
}).strict();

export const RoomSelectSchema: z.ZodType<Prisma.RoomSelect> = z.object({
  id: z.boolean().optional(),
  roomNumber: z.boolean().optional(),
  roomName: z.boolean().optional(),
  roomType: z.boolean().optional(),
  status: z.boolean().optional(),
  capacity: z.boolean().optional(),
  dailyRateUSD: z.boolean().optional(),
  reservations: z.union([z.boolean(),z.lazy(() => ReservationFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => RoomImageRelationFindManyArgsSchema)]).optional(),
  tasks: z.union([z.boolean(),z.lazy(() => TaskFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ROOM IMAGE
//------------------------------------------------------

export const RoomImageIncludeSchema: z.ZodType<Prisma.RoomImageInclude> = z.object({
  roomImages: z.union([z.boolean(),z.lazy(() => RoomImageRelationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomImageCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const RoomImageArgsSchema: z.ZodType<Prisma.RoomImageArgs> = z.object({
  select: z.lazy(() => RoomImageSelectSchema).optional(),
  include: z.lazy(() => RoomImageIncludeSchema).optional(),
}).strict();

export const RoomImageCountOutputTypeArgsSchema: z.ZodType<Prisma.RoomImageCountOutputTypeArgs> = z.object({
  select: z.lazy(() => RoomImageCountOutputTypeSelectSchema).nullish(),
}).strict();

export const RoomImageCountOutputTypeSelectSchema: z.ZodType<Prisma.RoomImageCountOutputTypeSelect> = z.object({
  roomImages: z.boolean().optional(),
}).strict();

export const RoomImageSelectSchema: z.ZodType<Prisma.RoomImageSelect> = z.object({
  id: z.boolean().optional(),
  fileUrl: z.boolean().optional(),
  fileKey: z.boolean().optional(),
  roomImages: z.union([z.boolean(),z.lazy(() => RoomImageRelationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RoomImageCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ROOM IMAGE RELATION
//------------------------------------------------------

export const RoomImageRelationIncludeSchema: z.ZodType<Prisma.RoomImageRelationInclude> = z.object({
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
  roomImage: z.union([z.boolean(),z.lazy(() => RoomImageArgsSchema)]).optional(),
}).strict()

export const RoomImageRelationArgsSchema: z.ZodType<Prisma.RoomImageRelationArgs> = z.object({
  select: z.lazy(() => RoomImageRelationSelectSchema).optional(),
  include: z.lazy(() => RoomImageRelationIncludeSchema).optional(),
}).strict();

export const RoomImageRelationSelectSchema: z.ZodType<Prisma.RoomImageRelationSelect> = z.object({
  id: z.boolean().optional(),
  roomId: z.boolean().optional(),
  roomImageId: z.boolean().optional(),
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
  roomImage: z.union([z.boolean(),z.lazy(() => RoomImageArgsSchema)]).optional(),
}).strict()

// GUEST
//------------------------------------------------------

export const GuestIncludeSchema: z.ZodType<Prisma.GuestInclude> = z.object({
  reservations: z.union([z.boolean(),z.lazy(() => ReservationFindManyArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => GuestCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const GuestArgsSchema: z.ZodType<Prisma.GuestArgs> = z.object({
  select: z.lazy(() => GuestSelectSchema).optional(),
  include: z.lazy(() => GuestIncludeSchema).optional(),
}).strict();

export const GuestCountOutputTypeArgsSchema: z.ZodType<Prisma.GuestCountOutputTypeArgs> = z.object({
  select: z.lazy(() => GuestCountOutputTypeSelectSchema).nullish(),
}).strict();

export const GuestCountOutputTypeSelectSchema: z.ZodType<Prisma.GuestCountOutputTypeSelect> = z.object({
  reservations: z.boolean().optional(),
  orders: z.boolean().optional(),
}).strict();

export const GuestSelectSchema: z.ZodType<Prisma.GuestSelect> = z.object({
  id: z.boolean().optional(),
  firstName: z.boolean().optional(),
  surname: z.boolean().optional(),
  fullName: z.boolean().optional(),
  email: z.boolean().optional(),
  currentReservationId: z.boolean().optional(),
  type: z.boolean().optional(),
  reservations: z.union([z.boolean(),z.lazy(() => ReservationFindManyArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => GuestCountOutputTypeArgsSchema)]).optional(),
}).strict()

// RESERVATION
//------------------------------------------------------

export const ReservationIncludeSchema: z.ZodType<Prisma.ReservationInclude> = z.object({
  guest: z.union([z.boolean(),z.lazy(() => GuestArgsSchema)]).optional(),
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReservationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ReservationArgsSchema: z.ZodType<Prisma.ReservationArgs> = z.object({
  select: z.lazy(() => ReservationSelectSchema).optional(),
  include: z.lazy(() => ReservationIncludeSchema).optional(),
}).strict();

export const ReservationCountOutputTypeArgsSchema: z.ZodType<Prisma.ReservationCountOutputTypeArgs> = z.object({
  select: z.lazy(() => ReservationCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ReservationCountOutputTypeSelectSchema: z.ZodType<Prisma.ReservationCountOutputTypeSelect> = z.object({
  orders: z.boolean().optional(),
}).strict();

export const ReservationSelectSchema: z.ZodType<Prisma.ReservationSelect> = z.object({
  id: z.boolean().optional(),
  guestId: z.boolean().optional(),
  userId: z.boolean().optional(),
  roomId: z.boolean().optional(),
  roomType: z.boolean().optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  guestName: z.boolean().optional(),
  guestEmail: z.boolean().optional(),
  subTotalUSD: z.boolean().optional(),
  paymentStatus: z.boolean().optional(),
  guest: z.union([z.boolean(),z.lazy(() => GuestArgsSchema)]).optional(),
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReservationCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TASK
//------------------------------------------------------

export const TaskIncludeSchema: z.ZodType<Prisma.TaskInclude> = z.object({
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
}).strict()

export const TaskArgsSchema: z.ZodType<Prisma.TaskArgs> = z.object({
  select: z.lazy(() => TaskSelectSchema).optional(),
  include: z.lazy(() => TaskIncludeSchema).optional(),
}).strict();

export const TaskSelectSchema: z.ZodType<Prisma.TaskSelect> = z.object({
  id: z.boolean().optional(),
  shortDesc: z.boolean().optional(),
  description: z.boolean().optional(),
  type: z.boolean().optional(),
  roomId: z.boolean().optional(),
  location: z.boolean().optional(),
  room: z.union([z.boolean(),z.lazy(() => RoomArgsSchema)]).optional(),
}).strict()

// ITEM
//------------------------------------------------------

export const ItemIncludeSchema: z.ZodType<Prisma.ItemInclude> = z.object({
  itemOrders: z.union([z.boolean(),z.lazy(() => ItemOrdersFindManyArgsSchema)]).optional(),
  ingredients: z.union([z.boolean(),z.lazy(() => ItemIngredientFindManyArgsSchema)]).optional(),
  usedByItems: z.union([z.boolean(),z.lazy(() => ItemIngredientFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ItemCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ItemArgsSchema: z.ZodType<Prisma.ItemArgs> = z.object({
  select: z.lazy(() => ItemSelectSchema).optional(),
  include: z.lazy(() => ItemIncludeSchema).optional(),
}).strict();

export const ItemCountOutputTypeArgsSchema: z.ZodType<Prisma.ItemCountOutputTypeArgs> = z.object({
  select: z.lazy(() => ItemCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ItemCountOutputTypeSelectSchema: z.ZodType<Prisma.ItemCountOutputTypeSelect> = z.object({
  itemOrders: z.boolean().optional(),
  ingredients: z.boolean().optional(),
  usedByItems: z.boolean().optional(),
}).strict();

export const ItemSelectSchema: z.ZodType<Prisma.ItemSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  priceUSD: z.boolean().optional(),
  happyHourPriceUSD: z.boolean().optional(),
  category: z.boolean().optional(),
  quantityInStock: z.boolean().optional(),
  quantityUnit: z.boolean().optional(),
  itemOrders: z.union([z.boolean(),z.lazy(() => ItemOrdersFindManyArgsSchema)]).optional(),
  ingredients: z.union([z.boolean(),z.lazy(() => ItemIngredientFindManyArgsSchema)]).optional(),
  usedByItems: z.union([z.boolean(),z.lazy(() => ItemIngredientFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ItemCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ITEM INGREDIENT
//------------------------------------------------------

export const ItemIngredientIncludeSchema: z.ZodType<Prisma.ItemIngredientInclude> = z.object({
  parentItems: z.union([z.boolean(),z.lazy(() => ItemFindManyArgsSchema)]).optional(),
  ingredient: z.union([z.boolean(),z.lazy(() => ItemArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ItemIngredientCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ItemIngredientArgsSchema: z.ZodType<Prisma.ItemIngredientArgs> = z.object({
  select: z.lazy(() => ItemIngredientSelectSchema).optional(),
  include: z.lazy(() => ItemIngredientIncludeSchema).optional(),
}).strict();

export const ItemIngredientCountOutputTypeArgsSchema: z.ZodType<Prisma.ItemIngredientCountOutputTypeArgs> = z.object({
  select: z.lazy(() => ItemIngredientCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ItemIngredientCountOutputTypeSelectSchema: z.ZodType<Prisma.ItemIngredientCountOutputTypeSelect> = z.object({
  parentItems: z.boolean().optional(),
}).strict();

export const ItemIngredientSelectSchema: z.ZodType<Prisma.ItemIngredientSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  ingredientId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  quantityUnit: z.boolean().optional(),
  parentItems: z.union([z.boolean(),z.lazy(() => ItemFindManyArgsSchema)]).optional(),
  ingredient: z.union([z.boolean(),z.lazy(() => ItemArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ItemIngredientCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ORDER
//------------------------------------------------------

export const OrderIncludeSchema: z.ZodType<Prisma.OrderInclude> = z.object({
  guest: z.union([z.boolean(),z.lazy(() => GuestArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => ItemOrdersFindManyArgsSchema)]).optional(),
  reservation: z.union([z.boolean(),z.lazy(() => ReservationArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const OrderArgsSchema: z.ZodType<Prisma.OrderArgs> = z.object({
  select: z.lazy(() => OrderSelectSchema).optional(),
  include: z.lazy(() => OrderIncludeSchema).optional(),
}).strict();

export const OrderCountOutputTypeArgsSchema: z.ZodType<Prisma.OrderCountOutputTypeArgs> = z.object({
  select: z.lazy(() => OrderCountOutputTypeSelectSchema).nullish(),
}).strict();

export const OrderCountOutputTypeSelectSchema: z.ZodType<Prisma.OrderCountOutputTypeSelect> = z.object({
  items: z.boolean().optional(),
}).strict();

export const OrderSelectSchema: z.ZodType<Prisma.OrderSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  guestId: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  status: z.boolean().optional(),
  reservationId: z.boolean().optional(),
  subTotalUSD: z.boolean().optional(),
  happyHour: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  guest: z.union([z.boolean(),z.lazy(() => GuestArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => ItemOrdersFindManyArgsSchema)]).optional(),
  reservation: z.union([z.boolean(),z.lazy(() => ReservationArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ITEM ORDERS
//------------------------------------------------------

export const ItemOrdersIncludeSchema: z.ZodType<Prisma.ItemOrdersInclude> = z.object({
  item: z.union([z.boolean(),z.lazy(() => ItemArgsSchema)]).optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict()

export const ItemOrdersArgsSchema: z.ZodType<Prisma.ItemOrdersArgs> = z.object({
  select: z.lazy(() => ItemOrdersSelectSchema).optional(),
  include: z.lazy(() => ItemOrdersIncludeSchema).optional(),
}).strict();

export const ItemOrdersSelectSchema: z.ZodType<Prisma.ItemOrdersSelect> = z.object({
  id: z.boolean().optional(),
  itemId: z.boolean().optional(),
  orderId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  item: z.union([z.boolean(),z.lazy(() => ItemArgsSchema)]).optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const RoomWhereInputSchema: z.ZodType<Prisma.RoomWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomWhereInputSchema),z.lazy(() => RoomWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomWhereInputSchema),z.lazy(() => RoomWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => EnumRoomTypeFilterSchema),z.lazy(() => RoomTypeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumRoomStatusFilterSchema),z.lazy(() => RoomStatusSchema) ]).optional(),
  capacity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  dailyRateUSD: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  reservations: z.lazy(() => ReservationListRelationFilterSchema).optional(),
  images: z.lazy(() => RoomImageRelationListRelationFilterSchema).optional(),
  tasks: z.lazy(() => TaskListRelationFilterSchema).optional()
}).strict();

export const RoomOrderByWithRelationInputSchema: z.ZodType<Prisma.RoomOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomNumber: z.lazy(() => SortOrderSchema).optional(),
  roomName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional(),
  reservations: z.lazy(() => ReservationOrderByRelationAggregateInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationOrderByRelationAggregateInputSchema).optional(),
  tasks: z.lazy(() => TaskOrderByRelationAggregateInputSchema).optional()
}).strict();

export const RoomWhereUniqueInputSchema: z.ZodType<Prisma.RoomWhereUniqueInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string().optional()
}).strict();

export const RoomOrderByWithAggregationInputSchema: z.ZodType<Prisma.RoomOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomNumber: z.lazy(() => SortOrderSchema).optional(),
  roomName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RoomCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => RoomAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RoomMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RoomMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => RoomSumOrderByAggregateInputSchema).optional()
}).strict();

export const RoomScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RoomScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => RoomScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  roomNumber: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  roomName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => EnumRoomTypeWithAggregatesFilterSchema),z.lazy(() => RoomTypeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumRoomStatusWithAggregatesFilterSchema),z.lazy(() => RoomStatusSchema) ]).optional(),
  capacity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  dailyRateUSD: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
}).strict();

export const RoomImageWhereInputSchema: z.ZodType<Prisma.RoomImageWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomImageWhereInputSchema),z.lazy(() => RoomImageWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomImageWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomImageWhereInputSchema),z.lazy(() => RoomImageWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileUrl: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomImages: z.lazy(() => RoomImageRelationListRelationFilterSchema).optional()
}).strict();

export const RoomImageOrderByWithRelationInputSchema: z.ZodType<Prisma.RoomImageOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  fileKey: z.lazy(() => SortOrderSchema).optional(),
  roomImages: z.lazy(() => RoomImageRelationOrderByRelationAggregateInputSchema).optional()
}).strict();

export const RoomImageWhereUniqueInputSchema: z.ZodType<Prisma.RoomImageWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const RoomImageOrderByWithAggregationInputSchema: z.ZodType<Prisma.RoomImageOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  fileKey: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RoomImageCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RoomImageMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RoomImageMinOrderByAggregateInputSchema).optional()
}).strict();

export const RoomImageScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RoomImageScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => RoomImageScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomImageScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomImageScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomImageScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomImageScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fileUrl: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fileKey: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const RoomImageRelationWhereInputSchema: z.ZodType<Prisma.RoomImageRelationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomImageRelationWhereInputSchema),z.lazy(() => RoomImageRelationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomImageRelationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomImageRelationWhereInputSchema),z.lazy(() => RoomImageRelationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomImageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  room: z.union([ z.lazy(() => RoomRelationFilterSchema),z.lazy(() => RoomWhereInputSchema) ]).optional(),
  roomImage: z.union([ z.lazy(() => RoomImageRelationFilterSchema),z.lazy(() => RoomImageWhereInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationOrderByWithRelationInputSchema: z.ZodType<Prisma.RoomImageRelationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomImageId: z.lazy(() => SortOrderSchema).optional(),
  room: z.lazy(() => RoomOrderByWithRelationInputSchema).optional(),
  roomImage: z.lazy(() => RoomImageOrderByWithRelationInputSchema).optional()
}).strict();

export const RoomImageRelationWhereUniqueInputSchema: z.ZodType<Prisma.RoomImageRelationWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const RoomImageRelationOrderByWithAggregationInputSchema: z.ZodType<Prisma.RoomImageRelationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomImageId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RoomImageRelationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RoomImageRelationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RoomImageRelationMinOrderByAggregateInputSchema).optional()
}).strict();

export const RoomImageRelationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RoomImageRelationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => RoomImageRelationScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomImageRelationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomImageRelationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomImageRelationScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomImageRelationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  roomId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  roomImageId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const GuestWhereInputSchema: z.ZodType<Prisma.GuestWhereInput> = z.object({
  AND: z.union([ z.lazy(() => GuestWhereInputSchema),z.lazy(() => GuestWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => GuestWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GuestWhereInputSchema),z.lazy(() => GuestWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  surname: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fullName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  currentReservationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumGuestTypeFilterSchema),z.lazy(() => GuestTypeSchema) ]).optional(),
  reservations: z.lazy(() => ReservationListRelationFilterSchema).optional(),
  orders: z.lazy(() => OrderListRelationFilterSchema).optional()
}).strict();

export const GuestOrderByWithRelationInputSchema: z.ZodType<Prisma.GuestOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  surname: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentReservationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  reservations: z.lazy(() => ReservationOrderByRelationAggregateInputSchema).optional(),
  orders: z.lazy(() => OrderOrderByRelationAggregateInputSchema).optional()
}).strict();

export const GuestWhereUniqueInputSchema: z.ZodType<Prisma.GuestWhereUniqueInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string().optional()
}).strict();

export const GuestOrderByWithAggregationInputSchema: z.ZodType<Prisma.GuestOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  surname: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentReservationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => GuestCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => GuestMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => GuestMinOrderByAggregateInputSchema).optional()
}).strict();

export const GuestScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.GuestScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => GuestScalarWhereWithAggregatesInputSchema),z.lazy(() => GuestScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => GuestScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GuestScalarWhereWithAggregatesInputSchema),z.lazy(() => GuestScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  surname: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fullName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  currentReservationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumGuestTypeWithAggregatesFilterSchema),z.lazy(() => GuestTypeSchema) ]).optional(),
}).strict();

export const ReservationWhereInputSchema: z.ZodType<Prisma.ReservationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReservationWhereInputSchema),z.lazy(() => ReservationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReservationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReservationWhereInputSchema),z.lazy(() => ReservationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  guestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  roomId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => EnumRoomTypeNullableFilterSchema),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumReservationStatusFilterSchema),z.lazy(() => ReservationStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  guestName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  guestEmail: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  subTotalUSD: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema),z.lazy(() => PaymentStatusSchema) ]).optional(),
  guest: z.union([ z.lazy(() => GuestRelationFilterSchema),z.lazy(() => GuestWhereInputSchema) ]).optional().nullable(),
  room: z.union([ z.lazy(() => RoomRelationFilterSchema),z.lazy(() => RoomWhereInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderListRelationFilterSchema).optional()
}).strict();

export const ReservationOrderByWithRelationInputSchema: z.ZodType<Prisma.ReservationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  guestName: z.lazy(() => SortOrderSchema).optional(),
  guestEmail: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  subTotalUSD: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentStatus: z.lazy(() => SortOrderSchema).optional(),
  guest: z.lazy(() => GuestOrderByWithRelationInputSchema).optional(),
  room: z.lazy(() => RoomOrderByWithRelationInputSchema).optional(),
  orders: z.lazy(() => OrderOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ReservationWhereUniqueInputSchema: z.ZodType<Prisma.ReservationWhereUniqueInput> = z.object({
  id: z.string().cuid().optional(),
  roomId: z.string().optional()
}).strict();

export const ReservationOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReservationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  guestName: z.lazy(() => SortOrderSchema).optional(),
  guestEmail: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  subTotalUSD: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentStatus: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReservationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ReservationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReservationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReservationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ReservationSumOrderByAggregateInputSchema).optional()
}).strict();

export const ReservationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReservationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReservationScalarWhereWithAggregatesInputSchema),z.lazy(() => ReservationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReservationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReservationScalarWhereWithAggregatesInputSchema),z.lazy(() => ReservationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  guestId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  roomId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => EnumRoomTypeNullableWithAggregatesFilterSchema),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  checkIn: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumReservationStatusWithAggregatesFilterSchema),z.lazy(() => ReservationStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  guestName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  guestEmail: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  subTotalUSD: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => EnumPaymentStatusWithAggregatesFilterSchema),z.lazy(() => PaymentStatusSchema) ]).optional(),
}).strict();

export const TaskWhereInputSchema: z.ZodType<Prisma.TaskWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TaskWhereInputSchema),z.lazy(() => TaskWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskWhereInputSchema),z.lazy(() => TaskWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shortDesc: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumTaskTypeFilterSchema),z.lazy(() => TaskTypeSchema) ]).optional(),
  roomId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  location: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  room: z.union([ z.lazy(() => RoomRelationFilterSchema),z.lazy(() => RoomWhereInputSchema) ]).optional().nullable(),
}).strict();

export const TaskOrderByWithRelationInputSchema: z.ZodType<Prisma.TaskOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shortDesc: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  location: z.lazy(() => SortOrderSchema).optional(),
  room: z.lazy(() => RoomOrderByWithRelationInputSchema).optional()
}).strict();

export const TaskWhereUniqueInputSchema: z.ZodType<Prisma.TaskWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const TaskOrderByWithAggregationInputSchema: z.ZodType<Prisma.TaskOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shortDesc: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  location: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TaskCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TaskMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TaskMinOrderByAggregateInputSchema).optional()
}).strict();

export const TaskScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TaskScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TaskScalarWhereWithAggregatesInputSchema),z.lazy(() => TaskScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskScalarWhereWithAggregatesInputSchema),z.lazy(() => TaskScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  shortDesc: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumTaskTypeWithAggregatesFilterSchema),z.lazy(() => TaskTypeSchema) ]).optional(),
  roomId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  location: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ItemWhereInputSchema: z.ZodType<Prisma.ItemWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ItemWhereInputSchema),z.lazy(() => ItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemWhereInputSchema),z.lazy(() => ItemWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  priceUSD: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  happyHourPriceUSD: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  category: z.union([ z.lazy(() => EnumItemCategoryFilterSchema),z.lazy(() => ItemCategorySchema) ]).optional(),
  quantityInStock: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  quantityUnit: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersListRelationFilterSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientListRelationFilterSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientListRelationFilterSchema).optional()
}).strict();

export const ItemOrderByWithRelationInputSchema: z.ZodType<Prisma.ItemOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  itemOrders: z.lazy(() => ItemOrdersOrderByRelationAggregateInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientOrderByRelationAggregateInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ItemWhereUniqueInputSchema: z.ZodType<Prisma.ItemWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const ItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.ItemOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ItemCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ItemAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ItemMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ItemMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ItemSumOrderByAggregateInputSchema).optional()
}).strict();

export const ItemScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ItemScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ItemScalarWhereWithAggregatesInputSchema),z.lazy(() => ItemScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemScalarWhereWithAggregatesInputSchema),z.lazy(() => ItemScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  priceUSD: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  happyHourPriceUSD: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  category: z.union([ z.lazy(() => EnumItemCategoryWithAggregatesFilterSchema),z.lazy(() => ItemCategorySchema) ]).optional(),
  quantityInStock: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  quantityUnit: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const ItemIngredientWhereInputSchema: z.ZodType<Prisma.ItemIngredientWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ItemIngredientWhereInputSchema),z.lazy(() => ItemIngredientWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemIngredientWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemIngredientWhereInputSchema),z.lazy(() => ItemIngredientWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ingredientId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantityUnit: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  parentItems: z.lazy(() => ItemListRelationFilterSchema).optional(),
  ingredient: z.union([ z.lazy(() => ItemRelationFilterSchema),z.lazy(() => ItemWhereInputSchema) ]).optional().nullable(),
}).strict();

export const ItemIngredientOrderByWithRelationInputSchema: z.ZodType<Prisma.ItemIngredientOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ingredientId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantityUnit: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  parentItems: z.lazy(() => ItemOrderByRelationAggregateInputSchema).optional(),
  ingredient: z.lazy(() => ItemOrderByWithRelationInputSchema).optional()
}).strict();

export const ItemIngredientWhereUniqueInputSchema: z.ZodType<Prisma.ItemIngredientWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const ItemIngredientOrderByWithAggregationInputSchema: z.ZodType<Prisma.ItemIngredientOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ingredientId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantityUnit: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ItemIngredientCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ItemIngredientAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ItemIngredientMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ItemIngredientMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ItemIngredientSumOrderByAggregateInputSchema).optional()
}).strict();

export const ItemIngredientScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ItemIngredientScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ItemIngredientScalarWhereWithAggregatesInputSchema),z.lazy(() => ItemIngredientScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemIngredientScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemIngredientScalarWhereWithAggregatesInputSchema),z.lazy(() => ItemIngredientScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  ingredientId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantityUnit: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const OrderWhereInputSchema: z.ZodType<Prisma.OrderWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrderWhereInputSchema),z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema),z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  guestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumOrderStatusNullableFilterSchema),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  reservationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  subTotalUSD: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  happyHour: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  guest: z.union([ z.lazy(() => GuestRelationFilterSchema),z.lazy(() => GuestWhereInputSchema) ]).optional().nullable(),
  items: z.lazy(() => ItemOrdersListRelationFilterSchema).optional(),
  reservation: z.union([ z.lazy(() => ReservationRelationFilterSchema),z.lazy(() => ReservationWhereInputSchema) ]).optional().nullable(),
}).strict();

export const OrderOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  guestId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reservationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHour: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  guest: z.lazy(() => GuestOrderByWithRelationInputSchema).optional(),
  items: z.lazy(() => ItemOrdersOrderByRelationAggregateInputSchema).optional(),
  reservation: z.lazy(() => ReservationOrderByWithRelationInputSchema).optional()
}).strict();

export const OrderWhereUniqueInputSchema: z.ZodType<Prisma.OrderWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const OrderOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  guestId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reservationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHour: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => OrderCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => OrderAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => OrderSumOrderByAggregateInputSchema).optional()
}).strict();

export const OrderScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => OrderScalarWhereWithAggregatesInputSchema),z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderScalarWhereWithAggregatesInputSchema),z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  guestId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumOrderStatusNullableWithAggregatesFilterSchema),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  reservationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  subTotalUSD: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  happyHour: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ItemOrdersWhereInputSchema: z.ZodType<Prisma.ItemOrdersWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ItemOrdersWhereInputSchema),z.lazy(() => ItemOrdersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemOrdersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemOrdersWhereInputSchema),z.lazy(() => ItemOrdersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  itemId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  item: z.union([ z.lazy(() => ItemRelationFilterSchema),z.lazy(() => ItemWhereInputSchema) ]).optional(),
  order: z.union([ z.lazy(() => OrderRelationFilterSchema),z.lazy(() => OrderWhereInputSchema) ]).optional(),
}).strict();

export const ItemOrdersOrderByWithRelationInputSchema: z.ZodType<Prisma.ItemOrdersOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  itemId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  item: z.lazy(() => ItemOrderByWithRelationInputSchema).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional()
}).strict();

export const ItemOrdersWhereUniqueInputSchema: z.ZodType<Prisma.ItemOrdersWhereUniqueInput> = z.object({
  id: z.string().cuid().optional()
}).strict();

export const ItemOrdersOrderByWithAggregationInputSchema: z.ZodType<Prisma.ItemOrdersOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  itemId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ItemOrdersCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ItemOrdersAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ItemOrdersMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ItemOrdersMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ItemOrdersSumOrderByAggregateInputSchema).optional()
}).strict();

export const ItemOrdersScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ItemOrdersScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ItemOrdersScalarWhereWithAggregatesInputSchema),z.lazy(() => ItemOrdersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemOrdersScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemOrdersScalarWhereWithAggregatesInputSchema),z.lazy(() => ItemOrdersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  itemId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const RoomCreateInputSchema: z.ZodType<Prisma.RoomCreateInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  reservations: z.lazy(() => ReservationCreateNestedManyWithoutRoomInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationCreateNestedManyWithoutRoomInputSchema).optional(),
  tasks: z.lazy(() => TaskCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomUncheckedCreateInputSchema: z.ZodType<Prisma.RoomUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  reservations: z.lazy(() => ReservationUncheckedCreateNestedManyWithoutRoomInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationUncheckedCreateNestedManyWithoutRoomInputSchema).optional(),
  tasks: z.lazy(() => TaskUncheckedCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomUpdateInputSchema: z.ZodType<Prisma.RoomUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUpdateManyWithoutRoomNestedInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationUpdateManyWithoutRoomNestedInputSchema).optional(),
  tasks: z.lazy(() => TaskUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const RoomUncheckedUpdateInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUncheckedUpdateManyWithoutRoomNestedInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationUncheckedUpdateManyWithoutRoomNestedInputSchema).optional(),
  tasks: z.lazy(() => TaskUncheckedUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const RoomCreateManyInputSchema: z.ZodType<Prisma.RoomCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional()
}).strict();

export const RoomUpdateManyMutationInputSchema: z.ZodType<Prisma.RoomUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomUncheckedUpdateManyInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageCreateInputSchema: z.ZodType<Prisma.RoomImageCreateInput> = z.object({
  id: z.string().cuid().optional(),
  fileUrl: z.string(),
  fileKey: z.string(),
  roomImages: z.lazy(() => RoomImageRelationCreateNestedManyWithoutRoomImageInputSchema).optional()
}).strict();

export const RoomImageUncheckedCreateInputSchema: z.ZodType<Prisma.RoomImageUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  fileUrl: z.string(),
  fileKey: z.string(),
  roomImages: z.lazy(() => RoomImageRelationUncheckedCreateNestedManyWithoutRoomImageInputSchema).optional()
}).strict();

export const RoomImageUpdateInputSchema: z.ZodType<Prisma.RoomImageUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImages: z.lazy(() => RoomImageRelationUpdateManyWithoutRoomImageNestedInputSchema).optional()
}).strict();

export const RoomImageUncheckedUpdateInputSchema: z.ZodType<Prisma.RoomImageUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImages: z.lazy(() => RoomImageRelationUncheckedUpdateManyWithoutRoomImageNestedInputSchema).optional()
}).strict();

export const RoomImageCreateManyInputSchema: z.ZodType<Prisma.RoomImageCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  fileUrl: z.string(),
  fileKey: z.string()
}).strict();

export const RoomImageUpdateManyMutationInputSchema: z.ZodType<Prisma.RoomImageUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageUncheckedUpdateManyInputSchema: z.ZodType<Prisma.RoomImageUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationCreateInputSchema: z.ZodType<Prisma.RoomImageRelationCreateInput> = z.object({
  id: z.string().cuid().optional(),
  room: z.lazy(() => RoomCreateNestedOneWithoutImagesInputSchema),
  roomImage: z.lazy(() => RoomImageCreateNestedOneWithoutRoomImagesInputSchema)
}).strict();

export const RoomImageRelationUncheckedCreateInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  roomId: z.string(),
  roomImageId: z.string()
}).strict();

export const RoomImageRelationUpdateInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  room: z.lazy(() => RoomUpdateOneRequiredWithoutImagesNestedInputSchema).optional(),
  roomImage: z.lazy(() => RoomImageUpdateOneRequiredWithoutRoomImagesNestedInputSchema).optional()
}).strict();

export const RoomImageRelationUncheckedUpdateInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImageId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationCreateManyInputSchema: z.ZodType<Prisma.RoomImageRelationCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  roomId: z.string(),
  roomImageId: z.string()
}).strict();

export const RoomImageRelationUpdateManyMutationInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImageId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const GuestCreateInputSchema: z.ZodType<Prisma.GuestCreateInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional(),
  reservations: z.lazy(() => ReservationCreateNestedManyWithoutGuestInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutGuestInputSchema).optional()
}).strict();

export const GuestUncheckedCreateInputSchema: z.ZodType<Prisma.GuestUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional(),
  reservations: z.lazy(() => ReservationUncheckedCreateNestedManyWithoutGuestInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutGuestInputSchema).optional()
}).strict();

export const GuestUpdateInputSchema: z.ZodType<Prisma.GuestUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUpdateManyWithoutGuestNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutGuestNestedInputSchema).optional()
}).strict();

export const GuestUncheckedUpdateInputSchema: z.ZodType<Prisma.GuestUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUncheckedUpdateManyWithoutGuestNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutGuestNestedInputSchema).optional()
}).strict();

export const GuestCreateManyInputSchema: z.ZodType<Prisma.GuestCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional()
}).strict();

export const GuestUpdateManyMutationInputSchema: z.ZodType<Prisma.GuestUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const GuestUncheckedUpdateManyInputSchema: z.ZodType<Prisma.GuestUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReservationCreateInputSchema: z.ZodType<Prisma.ReservationCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  guest: z.lazy(() => GuestCreateNestedOneWithoutReservationsInputSchema).optional(),
  room: z.lazy(() => RoomCreateNestedOneWithoutReservationsInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutReservationInputSchema).optional()
}).strict();

export const ReservationUncheckedCreateInputSchema: z.ZodType<Prisma.ReservationUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  guestId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutReservationInputSchema).optional()
}).strict();

export const ReservationUpdateInputSchema: z.ZodType<Prisma.ReservationUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  guest: z.lazy(() => GuestUpdateOneWithoutReservationsNestedInputSchema).optional(),
  room: z.lazy(() => RoomUpdateOneWithoutReservationsNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutReservationNestedInputSchema).optional()
}).strict();

export const ReservationUncheckedUpdateInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutReservationNestedInputSchema).optional()
}).strict();

export const ReservationCreateManyInputSchema: z.ZodType<Prisma.ReservationCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  guestId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional()
}).strict();

export const ReservationUpdateManyMutationInputSchema: z.ZodType<Prisma.ReservationUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReservationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TaskCreateInputSchema: z.ZodType<Prisma.TaskCreateInput> = z.object({
  id: z.string().cuid().optional(),
  shortDesc: z.string(),
  description: z.string(),
  type: z.lazy(() => TaskTypeSchema).optional(),
  location: z.string(),
  room: z.lazy(() => RoomCreateNestedOneWithoutTasksInputSchema).optional()
}).strict();

export const TaskUncheckedCreateInputSchema: z.ZodType<Prisma.TaskUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  shortDesc: z.string(),
  description: z.string(),
  type: z.lazy(() => TaskTypeSchema).optional(),
  roomId: z.string().optional().nullable(),
  location: z.string()
}).strict();

export const TaskUpdateInputSchema: z.ZodType<Prisma.TaskUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  room: z.lazy(() => RoomUpdateOneWithoutTasksNestedInputSchema).optional()
}).strict();

export const TaskUncheckedUpdateInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  roomId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TaskCreateManyInputSchema: z.ZodType<Prisma.TaskCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  shortDesc: z.string(),
  description: z.string(),
  type: z.lazy(() => TaskTypeSchema).optional(),
  roomId: z.string().optional().nullable(),
  location: z.string()
}).strict();

export const TaskUpdateManyMutationInputSchema: z.ZodType<Prisma.TaskUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TaskUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  roomId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemCreateInputSchema: z.ZodType<Prisma.ItemCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersCreateNestedManyWithoutItemInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientCreateNestedManyWithoutParentItemsInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientCreateNestedManyWithoutIngredientInputSchema).optional()
}).strict();

export const ItemUncheckedCreateInputSchema: z.ZodType<Prisma.ItemUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUncheckedCreateNestedManyWithoutItemInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientUncheckedCreateNestedManyWithoutParentItemsInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUncheckedCreateNestedManyWithoutIngredientInputSchema).optional()
}).strict();

export const ItemUpdateInputSchema: z.ZodType<Prisma.ItemUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUpdateManyWithoutItemNestedInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientUpdateManyWithoutParentItemsNestedInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUpdateManyWithoutIngredientNestedInputSchema).optional()
}).strict();

export const ItemUncheckedUpdateInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutItemNestedInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutParentItemsNestedInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutIngredientNestedInputSchema).optional()
}).strict();

export const ItemCreateManyInputSchema: z.ZodType<Prisma.ItemCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable()
}).strict();

export const ItemUpdateManyMutationInputSchema: z.ZodType<Prisma.ItemUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemIngredientCreateInputSchema: z.ZodType<Prisma.ItemIngredientCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable(),
  parentItems: z.lazy(() => ItemCreateNestedManyWithoutIngredientsInputSchema).optional(),
  ingredient: z.lazy(() => ItemCreateNestedOneWithoutUsedByItemsInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedCreateInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  ingredientId: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable(),
  parentItems: z.lazy(() => ItemUncheckedCreateNestedManyWithoutIngredientsInputSchema).optional()
}).strict();

export const ItemIngredientUpdateInputSchema: z.ZodType<Prisma.ItemIngredientUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentItems: z.lazy(() => ItemUpdateManyWithoutIngredientsNestedInputSchema).optional(),
  ingredient: z.lazy(() => ItemUpdateOneWithoutUsedByItemsNestedInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedUpdateInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredientId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentItems: z.lazy(() => ItemUncheckedUpdateManyWithoutIngredientsNestedInputSchema).optional()
}).strict();

export const ItemIngredientCreateManyInputSchema: z.ZodType<Prisma.ItemIngredientCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  ingredientId: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable()
}).strict();

export const ItemIngredientUpdateManyMutationInputSchema: z.ZodType<Prisma.ItemIngredientUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemIngredientUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredientId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrderCreateInputSchema: z.ZodType<Prisma.OrderCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  guest: z.lazy(() => GuestCreateNestedOneWithoutOrdersInputSchema).optional(),
  items: z.lazy(() => ItemOrdersCreateNestedManyWithoutOrderInputSchema).optional(),
  reservation: z.lazy(() => ReservationCreateNestedOneWithoutOrdersInputSchema).optional()
}).strict();

export const OrderUncheckedCreateInputSchema: z.ZodType<Prisma.OrderUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  items: z.lazy(() => ItemOrdersUncheckedCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export const OrderUpdateInputSchema: z.ZodType<Prisma.OrderUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guest: z.lazy(() => GuestUpdateOneWithoutOrdersNestedInputSchema).optional(),
  items: z.lazy(() => ItemOrdersUpdateManyWithoutOrderNestedInputSchema).optional(),
  reservation: z.lazy(() => ReservationUpdateOneWithoutOrdersNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderCreateManyInputSchema: z.ZodType<Prisma.OrderCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const OrderUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemOrdersCreateInputSchema: z.ZodType<Prisma.ItemOrdersCreateInput> = z.object({
  id: z.string().cuid().optional(),
  quantity: z.number().int().optional(),
  item: z.lazy(() => ItemCreateNestedOneWithoutItemOrdersInputSchema),
  order: z.lazy(() => OrderCreateNestedOneWithoutItemsInputSchema)
}).strict();

export const ItemOrdersUncheckedCreateInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  itemId: z.string(),
  orderId: z.string(),
  quantity: z.number().int().optional()
}).strict();

export const ItemOrdersUpdateInputSchema: z.ZodType<Prisma.ItemOrdersUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  item: z.lazy(() => ItemUpdateOneRequiredWithoutItemOrdersNestedInputSchema).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutItemsNestedInputSchema).optional()
}).strict();

export const ItemOrdersUncheckedUpdateInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  itemId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemOrdersCreateManyInputSchema: z.ZodType<Prisma.ItemOrdersCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  itemId: z.string(),
  orderId: z.string(),
  quantity: z.number().int().optional()
}).strict();

export const ItemOrdersUpdateManyMutationInputSchema: z.ZodType<Prisma.ItemOrdersUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemOrdersUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  itemId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.union([ z.string().array(),z.string() ]).optional(),
  notIn: z.union([ z.string().array(),z.string() ]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  notIn: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumRoomTypeFilterSchema: z.ZodType<Prisma.EnumRoomTypeFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeFilterSchema) ]).optional(),
}).strict();

export const EnumRoomStatusFilterSchema: z.ZodType<Prisma.EnumRoomStatusFilter> = z.object({
  equals: z.lazy(() => RoomStatusSchema).optional(),
  in: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => NestedEnumRoomStatusFilterSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.union([ z.number().array(),z.number() ]).optional(),
  notIn: z.union([ z.number().array(),z.number() ]).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const ReservationListRelationFilterSchema: z.ZodType<Prisma.ReservationListRelationFilter> = z.object({
  every: z.lazy(() => ReservationWhereInputSchema).optional(),
  some: z.lazy(() => ReservationWhereInputSchema).optional(),
  none: z.lazy(() => ReservationWhereInputSchema).optional()
}).strict();

export const RoomImageRelationListRelationFilterSchema: z.ZodType<Prisma.RoomImageRelationListRelationFilter> = z.object({
  every: z.lazy(() => RoomImageRelationWhereInputSchema).optional(),
  some: z.lazy(() => RoomImageRelationWhereInputSchema).optional(),
  none: z.lazy(() => RoomImageRelationWhereInputSchema).optional()
}).strict();

export const TaskListRelationFilterSchema: z.ZodType<Prisma.TaskListRelationFilter> = z.object({
  every: z.lazy(() => TaskWhereInputSchema).optional(),
  some: z.lazy(() => TaskWhereInputSchema).optional(),
  none: z.lazy(() => TaskWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const ReservationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReservationOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomImageRelationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RoomImageRelationOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TaskOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TaskOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomCountOrderByAggregateInputSchema: z.ZodType<Prisma.RoomCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomNumber: z.lazy(() => SortOrderSchema).optional(),
  roomName: z.lazy(() => SortOrderSchema).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomAvgOrderByAggregateInputSchema: z.ZodType<Prisma.RoomAvgOrderByAggregateInput> = z.object({
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RoomMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomNumber: z.lazy(() => SortOrderSchema).optional(),
  roomName: z.lazy(() => SortOrderSchema).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomMinOrderByAggregateInputSchema: z.ZodType<Prisma.RoomMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomNumber: z.lazy(() => SortOrderSchema).optional(),
  roomName: z.lazy(() => SortOrderSchema).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomSumOrderByAggregateInputSchema: z.ZodType<Prisma.RoomSumOrderByAggregateInput> = z.object({
  capacity: z.lazy(() => SortOrderSchema).optional(),
  dailyRateUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.union([ z.string().array(),z.string() ]).optional(),
  notIn: z.union([ z.string().array(),z.string() ]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  notIn: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const EnumRoomTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoomTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoomTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoomTypeFilterSchema).optional()
}).strict();

export const EnumRoomStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoomStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoomStatusSchema).optional(),
  in: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => NestedEnumRoomStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoomStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoomStatusFilterSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.union([ z.number().array(),z.number() ]).optional(),
  notIn: z.union([ z.number().array(),z.number() ]).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const RoomImageCountOrderByAggregateInputSchema: z.ZodType<Prisma.RoomImageCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  fileKey: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomImageMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RoomImageMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  fileKey: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomImageMinOrderByAggregateInputSchema: z.ZodType<Prisma.RoomImageMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  fileKey: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomRelationFilterSchema: z.ZodType<Prisma.RoomRelationFilter> = z.object({
  is: z.lazy(() => RoomWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => RoomWhereInputSchema).optional().nullable()
}).strict();

export const RoomImageRelationFilterSchema: z.ZodType<Prisma.RoomImageRelationFilter> = z.object({
  is: z.lazy(() => RoomImageWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => RoomImageWhereInputSchema).optional().nullable()
}).strict();

export const RoomImageRelationCountOrderByAggregateInputSchema: z.ZodType<Prisma.RoomImageRelationCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomImageId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomImageRelationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RoomImageRelationMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomImageId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const RoomImageRelationMinOrderByAggregateInputSchema: z.ZodType<Prisma.RoomImageRelationMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomImageId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumGuestTypeFilterSchema: z.ZodType<Prisma.EnumGuestTypeFilter> = z.object({
  equals: z.lazy(() => GuestTypeSchema).optional(),
  in: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => NestedEnumGuestTypeFilterSchema) ]).optional(),
}).strict();

export const OrderListRelationFilterSchema: z.ZodType<Prisma.OrderListRelationFilter> = z.object({
  every: z.lazy(() => OrderWhereInputSchema).optional(),
  some: z.lazy(() => OrderWhereInputSchema).optional(),
  none: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export const OrderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const GuestCountOrderByAggregateInputSchema: z.ZodType<Prisma.GuestCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  surname: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentReservationId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const GuestMaxOrderByAggregateInputSchema: z.ZodType<Prisma.GuestMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  surname: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentReservationId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const GuestMinOrderByAggregateInputSchema: z.ZodType<Prisma.GuestMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  surname: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentReservationId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumGuestTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumGuestTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GuestTypeSchema).optional(),
  in: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => NestedEnumGuestTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGuestTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGuestTypeFilterSchema).optional()
}).strict();

export const EnumRoomTypeNullableFilterSchema: z.ZodType<Prisma.EnumRoomTypeNullableFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional().nullable(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const EnumReservationStatusFilterSchema: z.ZodType<Prisma.EnumReservationStatusFilter> = z.object({
  equals: z.lazy(() => ReservationStatusSchema).optional(),
  in: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => NestedEnumReservationStatusFilterSchema) ]).optional(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DecimalNullableFilterSchema: z.ZodType<Prisma.DecimalNullableFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumPaymentStatusFilterSchema: z.ZodType<Prisma.EnumPaymentStatusFilter> = z.object({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => NestedEnumPaymentStatusFilterSchema) ]).optional(),
}).strict();

export const GuestRelationFilterSchema: z.ZodType<Prisma.GuestRelationFilter> = z.object({
  is: z.lazy(() => GuestWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => GuestWhereInputSchema).optional().nullable()
}).strict();

export const ReservationCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReservationCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  guestName: z.lazy(() => SortOrderSchema).optional(),
  guestEmail: z.lazy(() => SortOrderSchema).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  paymentStatus: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReservationAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReservationAvgOrderByAggregateInput> = z.object({
  subTotalUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReservationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReservationMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  guestName: z.lazy(() => SortOrderSchema).optional(),
  guestEmail: z.lazy(() => SortOrderSchema).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  paymentStatus: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReservationMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReservationMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  roomType: z.lazy(() => SortOrderSchema).optional(),
  checkIn: z.lazy(() => SortOrderSchema).optional(),
  checkOut: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  guestName: z.lazy(() => SortOrderSchema).optional(),
  guestEmail: z.lazy(() => SortOrderSchema).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  paymentStatus: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReservationSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReservationSumOrderByAggregateInput> = z.object({
  subTotalUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumRoomTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoomTypeNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional().nullable(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoomTypeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoomTypeNullableFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const EnumReservationStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumReservationStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ReservationStatusSchema).optional(),
  in: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => NestedEnumReservationStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReservationStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReservationStatusFilterSchema).optional()
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const DecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalNullableWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional()
}).strict();

export const EnumPaymentStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPaymentStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => NestedEnumPaymentStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional()
}).strict();

export const EnumTaskTypeFilterSchema: z.ZodType<Prisma.EnumTaskTypeFilter> = z.object({
  equals: z.lazy(() => TaskTypeSchema).optional(),
  in: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => NestedEnumTaskTypeFilterSchema) ]).optional(),
}).strict();

export const TaskCountOrderByAggregateInputSchema: z.ZodType<Prisma.TaskCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shortDesc: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  location: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TaskMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TaskMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shortDesc: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  location: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TaskMinOrderByAggregateInputSchema: z.ZodType<Prisma.TaskMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  shortDesc: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  roomId: z.lazy(() => SortOrderSchema).optional(),
  location: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumTaskTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumTaskTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => TaskTypeSchema).optional(),
  in: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => NestedEnumTaskTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumTaskTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumTaskTypeFilterSchema).optional()
}).strict();

export const EnumItemCategoryFilterSchema: z.ZodType<Prisma.EnumItemCategoryFilter> = z.object({
  equals: z.lazy(() => ItemCategorySchema).optional(),
  in: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  not: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => NestedEnumItemCategoryFilterSchema) ]).optional(),
}).strict();

export const ItemOrdersListRelationFilterSchema: z.ZodType<Prisma.ItemOrdersListRelationFilter> = z.object({
  every: z.lazy(() => ItemOrdersWhereInputSchema).optional(),
  some: z.lazy(() => ItemOrdersWhereInputSchema).optional(),
  none: z.lazy(() => ItemOrdersWhereInputSchema).optional()
}).strict();

export const ItemIngredientListRelationFilterSchema: z.ZodType<Prisma.ItemIngredientListRelationFilter> = z.object({
  every: z.lazy(() => ItemIngredientWhereInputSchema).optional(),
  some: z.lazy(() => ItemIngredientWhereInputSchema).optional(),
  none: z.lazy(() => ItemIngredientWhereInputSchema).optional()
}).strict();

export const ItemOrdersOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ItemOrdersOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemIngredientOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ItemIngredientOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemCountOrderByAggregateInputSchema: z.ZodType<Prisma.ItemCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ItemAvgOrderByAggregateInput> = z.object({
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ItemMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemMinOrderByAggregateInputSchema: z.ZodType<Prisma.ItemMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemSumOrderByAggregateInputSchema: z.ZodType<Prisma.ItemSumOrderByAggregateInput> = z.object({
  priceUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHourPriceUSD: z.lazy(() => SortOrderSchema).optional(),
  quantityInStock: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumItemCategoryWithAggregatesFilterSchema: z.ZodType<Prisma.EnumItemCategoryWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ItemCategorySchema).optional(),
  in: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  not: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => NestedEnumItemCategoryWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumItemCategoryFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumItemCategoryFilterSchema).optional()
}).strict();

export const ItemListRelationFilterSchema: z.ZodType<Prisma.ItemListRelationFilter> = z.object({
  every: z.lazy(() => ItemWhereInputSchema).optional(),
  some: z.lazy(() => ItemWhereInputSchema).optional(),
  none: z.lazy(() => ItemWhereInputSchema).optional()
}).strict();

export const ItemRelationFilterSchema: z.ZodType<Prisma.ItemRelationFilter> = z.object({
  is: z.lazy(() => ItemWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ItemWhereInputSchema).optional().nullable()
}).strict();

export const ItemOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ItemOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemIngredientCountOrderByAggregateInputSchema: z.ZodType<Prisma.ItemIngredientCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ingredientId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemIngredientAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ItemIngredientAvgOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemIngredientMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ItemIngredientMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ingredientId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemIngredientMinOrderByAggregateInputSchema: z.ZodType<Prisma.ItemIngredientMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ingredientId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  quantityUnit: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemIngredientSumOrderByAggregateInputSchema: z.ZodType<Prisma.ItemIngredientSumOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumOrderStatusNullableFilterSchema: z.ZodType<Prisma.EnumOrderStatusNullableFilter> = z.object({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NestedEnumOrderStatusNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const ReservationRelationFilterSchema: z.ZodType<Prisma.ReservationRelationFilter> = z.object({
  is: z.lazy(() => ReservationWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ReservationWhereInputSchema).optional().nullable()
}).strict();

export const OrderCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  reservationId: z.lazy(() => SortOrderSchema).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHour: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderAvgOrderByAggregateInput> = z.object({
  subTotalUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  reservationId: z.lazy(() => SortOrderSchema).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHour: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  guestId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  reservationId: z.lazy(() => SortOrderSchema).optional(),
  subTotalUSD: z.lazy(() => SortOrderSchema).optional(),
  happyHour: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrderSumOrderByAggregateInputSchema: z.ZodType<Prisma.OrderSumOrderByAggregateInput> = z.object({
  subTotalUSD: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumOrderStatusNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumOrderStatusNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NestedEnumOrderStatusNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const OrderRelationFilterSchema: z.ZodType<Prisma.OrderRelationFilter> = z.object({
  is: z.lazy(() => OrderWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => OrderWhereInputSchema).optional().nullable()
}).strict();

export const ItemOrdersCountOrderByAggregateInputSchema: z.ZodType<Prisma.ItemOrdersCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  itemId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemOrdersAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ItemOrdersAvgOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemOrdersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ItemOrdersMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  itemId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemOrdersMinOrderByAggregateInputSchema: z.ZodType<Prisma.ItemOrdersMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  itemId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ItemOrdersSumOrderByAggregateInputSchema: z.ZodType<Prisma.ItemOrdersSumOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReservationCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.ReservationCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutRoomInputSchema),z.lazy(() => ReservationCreateWithoutRoomInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TaskCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.TaskCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => TaskCreateWithoutRoomInputSchema),z.lazy(() => TaskCreateWithoutRoomInputSchema).array(),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema),z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReservationUncheckedCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUncheckedCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutRoomInputSchema),z.lazy(() => ReservationCreateWithoutRoomInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationUncheckedCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TaskUncheckedCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.TaskUncheckedCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => TaskCreateWithoutRoomInputSchema),z.lazy(() => TaskCreateWithoutRoomInputSchema).array(),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema),z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const EnumRoomTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoomTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RoomTypeSchema).optional()
}).strict();

export const EnumRoomStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoomStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RoomStatusSchema).optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> = z.object({
  set: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  increment: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional()
}).strict();

export const ReservationUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.ReservationUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutRoomInputSchema),z.lazy(() => ReservationCreateWithoutRoomInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReservationUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => ReservationUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReservationUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => ReservationUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReservationUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => ReservationUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReservationScalarWhereInputSchema),z.lazy(() => ReservationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RoomImageRelationScalarWhereInputSchema),z.lazy(() => RoomImageRelationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TaskUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.TaskUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaskCreateWithoutRoomInputSchema),z.lazy(() => TaskCreateWithoutRoomInputSchema).array(),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema),z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaskUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => TaskUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaskUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => TaskUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaskUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => TaskUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaskScalarWhereInputSchema),z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReservationUncheckedUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutRoomInputSchema),z.lazy(() => ReservationCreateWithoutRoomInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReservationUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => ReservationUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReservationUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => ReservationUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReservationUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => ReservationUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReservationScalarWhereInputSchema),z.lazy(() => ReservationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationUncheckedUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RoomImageRelationScalarWhereInputSchema),z.lazy(() => RoomImageRelationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TaskUncheckedUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaskCreateWithoutRoomInputSchema),z.lazy(() => TaskCreateWithoutRoomInputSchema).array(),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema),z.lazy(() => TaskCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaskUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => TaskUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaskCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaskWhereUniqueInputSchema),z.lazy(() => TaskWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaskUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => TaskUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaskUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => TaskUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaskScalarWhereInputSchema),z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationCreateNestedManyWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationCreateNestedManyWithoutRoomImageInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomImageInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationUncheckedCreateNestedManyWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedCreateNestedManyWithoutRoomImageInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomImageInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationUpdateManyWithoutRoomImageNestedInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateManyWithoutRoomImageNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomImageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomImageInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomImageInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomImageInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RoomImageRelationScalarWhereInputSchema),z.lazy(() => RoomImageRelationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const RoomImageRelationUncheckedUpdateManyWithoutRoomImageNestedInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateManyWithoutRoomImageNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema).array(),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUpsertWithWhereUniqueWithoutRoomImageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomImageRelationCreateManyRoomImageInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RoomImageRelationWhereUniqueInputSchema),z.lazy(() => RoomImageRelationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUpdateWithWhereUniqueWithoutRoomImageInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUpdateManyWithWhereWithoutRoomImageInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RoomImageRelationScalarWhereInputSchema),z.lazy(() => RoomImageRelationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const RoomCreateNestedOneWithoutImagesInputSchema: z.ZodType<Prisma.RoomCreateNestedOneWithoutImagesInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutImagesInputSchema),z.lazy(() => RoomUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional()
}).strict();

export const RoomImageCreateNestedOneWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageCreateNestedOneWithoutRoomImagesInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageCreateWithoutRoomImagesInputSchema),z.lazy(() => RoomImageUncheckedCreateWithoutRoomImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomImageCreateOrConnectWithoutRoomImagesInputSchema).optional(),
  connect: z.lazy(() => RoomImageWhereUniqueInputSchema).optional()
}).strict();

export const RoomUpdateOneRequiredWithoutImagesNestedInputSchema: z.ZodType<Prisma.RoomUpdateOneRequiredWithoutImagesNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutImagesInputSchema),z.lazy(() => RoomUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutImagesInputSchema).optional(),
  upsert: z.lazy(() => RoomUpsertWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RoomUpdateWithoutImagesInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutImagesInputSchema) ]).optional(),
}).strict();

export const RoomImageUpdateOneRequiredWithoutRoomImagesNestedInputSchema: z.ZodType<Prisma.RoomImageUpdateOneRequiredWithoutRoomImagesNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomImageCreateWithoutRoomImagesInputSchema),z.lazy(() => RoomImageUncheckedCreateWithoutRoomImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomImageCreateOrConnectWithoutRoomImagesInputSchema).optional(),
  upsert: z.lazy(() => RoomImageUpsertWithoutRoomImagesInputSchema).optional(),
  connect: z.lazy(() => RoomImageWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RoomImageUpdateWithoutRoomImagesInputSchema),z.lazy(() => RoomImageUncheckedUpdateWithoutRoomImagesInputSchema) ]).optional(),
}).strict();

export const ReservationCreateNestedManyWithoutGuestInputSchema: z.ZodType<Prisma.ReservationCreateNestedManyWithoutGuestInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutGuestInputSchema),z.lazy(() => ReservationCreateWithoutGuestInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyGuestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const OrderCreateNestedManyWithoutGuestInputSchema: z.ZodType<Prisma.OrderCreateNestedManyWithoutGuestInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutGuestInputSchema),z.lazy(() => OrderCreateWithoutGuestInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema),z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyGuestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReservationUncheckedCreateNestedManyWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUncheckedCreateNestedManyWithoutGuestInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutGuestInputSchema),z.lazy(() => ReservationCreateWithoutGuestInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyGuestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const OrderUncheckedCreateNestedManyWithoutGuestInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutGuestInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutGuestInputSchema),z.lazy(() => OrderCreateWithoutGuestInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema),z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyGuestInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumGuestTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumGuestTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => GuestTypeSchema).optional()
}).strict();

export const ReservationUpdateManyWithoutGuestNestedInputSchema: z.ZodType<Prisma.ReservationUpdateManyWithoutGuestNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutGuestInputSchema),z.lazy(() => ReservationCreateWithoutGuestInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReservationUpsertWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => ReservationUpsertWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyGuestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReservationUpdateWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => ReservationUpdateWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReservationUpdateManyWithWhereWithoutGuestInputSchema),z.lazy(() => ReservationUpdateManyWithWhereWithoutGuestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReservationScalarWhereInputSchema),z.lazy(() => ReservationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const OrderUpdateManyWithoutGuestNestedInputSchema: z.ZodType<Prisma.OrderUpdateManyWithoutGuestNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutGuestInputSchema),z.lazy(() => OrderCreateWithoutGuestInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema),z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyGuestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutGuestInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutGuestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReservationUncheckedUpdateManyWithoutGuestNestedInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateManyWithoutGuestNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutGuestInputSchema),z.lazy(() => ReservationCreateWithoutGuestInputSchema).array(),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema),z.lazy(() => ReservationCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReservationUpsertWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => ReservationUpsertWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReservationCreateManyGuestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReservationWhereUniqueInputSchema),z.lazy(() => ReservationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReservationUpdateWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => ReservationUpdateWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReservationUpdateManyWithWhereWithoutGuestInputSchema),z.lazy(() => ReservationUpdateManyWithWhereWithoutGuestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReservationScalarWhereInputSchema),z.lazy(() => ReservationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const OrderUncheckedUpdateManyWithoutGuestNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutGuestNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutGuestInputSchema),z.lazy(() => OrderCreateWithoutGuestInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema),z.lazy(() => OrderCreateOrConnectWithoutGuestInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyGuestInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutGuestInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutGuestInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutGuestInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutGuestInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const GuestCreateNestedOneWithoutReservationsInputSchema: z.ZodType<Prisma.GuestCreateNestedOneWithoutReservationsInput> = z.object({
  create: z.union([ z.lazy(() => GuestCreateWithoutReservationsInputSchema),z.lazy(() => GuestUncheckedCreateWithoutReservationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GuestCreateOrConnectWithoutReservationsInputSchema).optional(),
  connect: z.lazy(() => GuestWhereUniqueInputSchema).optional()
}).strict();

export const RoomCreateNestedOneWithoutReservationsInputSchema: z.ZodType<Prisma.RoomCreateNestedOneWithoutReservationsInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutReservationsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutReservationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutReservationsInputSchema).optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional()
}).strict();

export const OrderCreateNestedManyWithoutReservationInputSchema: z.ZodType<Prisma.OrderCreateNestedManyWithoutReservationInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutReservationInputSchema),z.lazy(() => OrderCreateWithoutReservationInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema),z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyReservationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const OrderUncheckedCreateNestedManyWithoutReservationInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutReservationInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutReservationInputSchema),z.lazy(() => OrderCreateWithoutReservationInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema),z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyReservationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableEnumRoomTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumRoomTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RoomTypeSchema).optional().nullable()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const EnumReservationStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReservationStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ReservationStatusSchema).optional()
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export const NullableDecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDecimalFieldUpdateOperationsInput> = z.object({
  set: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  increment: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional()
}).strict();

export const EnumPaymentStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => PaymentStatusSchema).optional()
}).strict();

export const GuestUpdateOneWithoutReservationsNestedInputSchema: z.ZodType<Prisma.GuestUpdateOneWithoutReservationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => GuestCreateWithoutReservationsInputSchema),z.lazy(() => GuestUncheckedCreateWithoutReservationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GuestCreateOrConnectWithoutReservationsInputSchema).optional(),
  upsert: z.lazy(() => GuestUpsertWithoutReservationsInputSchema).optional(),
  disconnect: z.boolean().optional(),
  delete: z.boolean().optional(),
  connect: z.lazy(() => GuestWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => GuestUpdateWithoutReservationsInputSchema),z.lazy(() => GuestUncheckedUpdateWithoutReservationsInputSchema) ]).optional(),
}).strict();

export const RoomUpdateOneWithoutReservationsNestedInputSchema: z.ZodType<Prisma.RoomUpdateOneWithoutReservationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutReservationsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutReservationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutReservationsInputSchema).optional(),
  upsert: z.lazy(() => RoomUpsertWithoutReservationsInputSchema).optional(),
  disconnect: z.boolean().optional(),
  delete: z.boolean().optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RoomUpdateWithoutReservationsInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutReservationsInputSchema) ]).optional(),
}).strict();

export const OrderUpdateManyWithoutReservationNestedInputSchema: z.ZodType<Prisma.OrderUpdateManyWithoutReservationNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutReservationInputSchema),z.lazy(() => OrderCreateWithoutReservationInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema),z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutReservationInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutReservationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyReservationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutReservationInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutReservationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutReservationInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutReservationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const OrderUncheckedUpdateManyWithoutReservationNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutReservationNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutReservationInputSchema),z.lazy(() => OrderCreateWithoutReservationInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema),z.lazy(() => OrderCreateOrConnectWithoutReservationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutReservationInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutReservationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyReservationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutReservationInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutReservationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutReservationInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutReservationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const RoomCreateNestedOneWithoutTasksInputSchema: z.ZodType<Prisma.RoomCreateNestedOneWithoutTasksInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutTasksInputSchema),z.lazy(() => RoomUncheckedCreateWithoutTasksInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutTasksInputSchema).optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional()
}).strict();

export const EnumTaskTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumTaskTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => TaskTypeSchema).optional()
}).strict();

export const RoomUpdateOneWithoutTasksNestedInputSchema: z.ZodType<Prisma.RoomUpdateOneWithoutTasksNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutTasksInputSchema),z.lazy(() => RoomUncheckedCreateWithoutTasksInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomCreateOrConnectWithoutTasksInputSchema).optional(),
  upsert: z.lazy(() => RoomUpsertWithoutTasksInputSchema).optional(),
  disconnect: z.boolean().optional(),
  delete: z.boolean().optional(),
  connect: z.lazy(() => RoomWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RoomUpdateWithoutTasksInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutTasksInputSchema) ]).optional(),
}).strict();

export const ItemOrdersCreateNestedManyWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersCreateNestedManyWithoutItemInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateWithoutItemInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyItemInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientCreateNestedManyWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientCreateNestedManyWithoutParentItemsInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientCreateNestedManyWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientCreateNestedManyWithoutIngredientInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemIngredientCreateManyIngredientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemOrdersUncheckedCreateNestedManyWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedCreateNestedManyWithoutItemInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateWithoutItemInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyItemInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientUncheckedCreateNestedManyWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedCreateNestedManyWithoutParentItemsInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientUncheckedCreateNestedManyWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedCreateNestedManyWithoutIngredientInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemIngredientCreateManyIngredientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumItemCategoryFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumItemCategoryFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ItemCategorySchema).optional()
}).strict();

export const ItemOrdersUpdateManyWithoutItemNestedInputSchema: z.ZodType<Prisma.ItemOrdersUpdateManyWithoutItemNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateWithoutItemInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutItemInputSchema),z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutItemInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyItemInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutItemInputSchema),z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutItemInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutItemInputSchema),z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutItemInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemOrdersScalarWhereInputSchema),z.lazy(() => ItemOrdersScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientUpdateManyWithoutParentItemsNestedInputSchema: z.ZodType<Prisma.ItemIngredientUpdateManyWithoutParentItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutParentItemsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutParentItemsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutParentItemsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemIngredientScalarWhereInputSchema),z.lazy(() => ItemIngredientScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientUpdateManyWithoutIngredientNestedInputSchema: z.ZodType<Prisma.ItemIngredientUpdateManyWithoutIngredientNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutIngredientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemIngredientCreateManyIngredientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutIngredientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutIngredientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemIngredientScalarWhereInputSchema),z.lazy(() => ItemIngredientScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemOrdersUncheckedUpdateManyWithoutItemNestedInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateManyWithoutItemNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateWithoutItemInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutItemInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutItemInputSchema),z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutItemInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyItemInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutItemInputSchema),z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutItemInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutItemInputSchema),z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutItemInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemOrdersScalarWhereInputSchema),z.lazy(() => ItemOrdersScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientUncheckedUpdateManyWithoutParentItemsNestedInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateManyWithoutParentItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutParentItemsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutParentItemsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutParentItemsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutParentItemsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemIngredientScalarWhereInputSchema),z.lazy(() => ItemIngredientScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemIngredientUncheckedUpdateManyWithoutIngredientNestedInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateManyWithoutIngredientNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema).array(),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema),z.lazy(() => ItemIngredientCreateOrConnectWithoutIngredientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUpsertWithWhereUniqueWithoutIngredientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemIngredientCreateManyIngredientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemIngredientWhereUniqueInputSchema),z.lazy(() => ItemIngredientWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUpdateWithWhereUniqueWithoutIngredientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUpdateManyWithWhereWithoutIngredientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemIngredientScalarWhereInputSchema),z.lazy(() => ItemIngredientScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemCreateNestedManyWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemCreateNestedManyWithoutIngredientsInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutIngredientsInputSchema),z.lazy(() => ItemCreateWithoutIngredientsInputSchema).array(),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema),z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemCreateNestedOneWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemCreateNestedOneWithoutUsedByItemsInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutUsedByItemsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutUsedByItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ItemCreateOrConnectWithoutUsedByItemsInputSchema).optional(),
  connect: z.lazy(() => ItemWhereUniqueInputSchema).optional()
}).strict();

export const ItemUncheckedCreateNestedManyWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUncheckedCreateNestedManyWithoutIngredientsInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutIngredientsInputSchema),z.lazy(() => ItemCreateWithoutIngredientsInputSchema).array(),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema),z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ItemUpdateManyWithoutIngredientsNestedInputSchema: z.ZodType<Prisma.ItemUpdateManyWithoutIngredientsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutIngredientsInputSchema),z.lazy(() => ItemCreateWithoutIngredientsInputSchema).array(),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema),z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemUpsertWithWhereUniqueWithoutIngredientsInputSchema),z.lazy(() => ItemUpsertWithWhereUniqueWithoutIngredientsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemUpdateWithWhereUniqueWithoutIngredientsInputSchema),z.lazy(() => ItemUpdateWithWhereUniqueWithoutIngredientsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemUpdateManyWithWhereWithoutIngredientsInputSchema),z.lazy(() => ItemUpdateManyWithWhereWithoutIngredientsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemScalarWhereInputSchema),z.lazy(() => ItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemUpdateOneWithoutUsedByItemsNestedInputSchema: z.ZodType<Prisma.ItemUpdateOneWithoutUsedByItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutUsedByItemsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutUsedByItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ItemCreateOrConnectWithoutUsedByItemsInputSchema).optional(),
  upsert: z.lazy(() => ItemUpsertWithoutUsedByItemsInputSchema).optional(),
  disconnect: z.boolean().optional(),
  delete: z.boolean().optional(),
  connect: z.lazy(() => ItemWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ItemUpdateWithoutUsedByItemsInputSchema),z.lazy(() => ItemUncheckedUpdateWithoutUsedByItemsInputSchema) ]).optional(),
}).strict();

export const ItemUncheckedUpdateManyWithoutIngredientsNestedInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateManyWithoutIngredientsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutIngredientsInputSchema),z.lazy(() => ItemCreateWithoutIngredientsInputSchema).array(),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema),z.lazy(() => ItemCreateOrConnectWithoutIngredientsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemUpsertWithWhereUniqueWithoutIngredientsInputSchema),z.lazy(() => ItemUpsertWithWhereUniqueWithoutIngredientsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemWhereUniqueInputSchema),z.lazy(() => ItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemUpdateWithWhereUniqueWithoutIngredientsInputSchema),z.lazy(() => ItemUpdateWithWhereUniqueWithoutIngredientsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemUpdateManyWithWhereWithoutIngredientsInputSchema),z.lazy(() => ItemUpdateManyWithWhereWithoutIngredientsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemScalarWhereInputSchema),z.lazy(() => ItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const GuestCreateNestedOneWithoutOrdersInputSchema: z.ZodType<Prisma.GuestCreateNestedOneWithoutOrdersInput> = z.object({
  create: z.union([ z.lazy(() => GuestCreateWithoutOrdersInputSchema),z.lazy(() => GuestUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GuestCreateOrConnectWithoutOrdersInputSchema).optional(),
  connect: z.lazy(() => GuestWhereUniqueInputSchema).optional()
}).strict();

export const ItemOrdersCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersCreateNestedManyWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReservationCreateNestedOneWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationCreateNestedOneWithoutOrdersInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutOrdersInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReservationCreateOrConnectWithoutOrdersInputSchema).optional(),
  connect: z.lazy(() => ReservationWhereUniqueInputSchema).optional()
}).strict();

export const ItemOrdersUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedCreateNestedManyWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableEnumOrderStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumOrderStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => OrderStatusSchema).optional().nullable()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const GuestUpdateOneWithoutOrdersNestedInputSchema: z.ZodType<Prisma.GuestUpdateOneWithoutOrdersNestedInput> = z.object({
  create: z.union([ z.lazy(() => GuestCreateWithoutOrdersInputSchema),z.lazy(() => GuestUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GuestCreateOrConnectWithoutOrdersInputSchema).optional(),
  upsert: z.lazy(() => GuestUpsertWithoutOrdersInputSchema).optional(),
  disconnect: z.boolean().optional(),
  delete: z.boolean().optional(),
  connect: z.lazy(() => GuestWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => GuestUpdateWithoutOrdersInputSchema),z.lazy(() => GuestUncheckedUpdateWithoutOrdersInputSchema) ]).optional(),
}).strict();

export const ItemOrdersUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.ItemOrdersUpdateManyWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutOrderInputSchema),z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemOrdersScalarWhereInputSchema),z.lazy(() => ItemOrdersScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReservationUpdateOneWithoutOrdersNestedInputSchema: z.ZodType<Prisma.ReservationUpdateOneWithoutOrdersNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReservationCreateWithoutOrdersInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReservationCreateOrConnectWithoutOrdersInputSchema).optional(),
  upsert: z.lazy(() => ReservationUpsertWithoutOrdersInputSchema).optional(),
  disconnect: z.boolean().optional(),
  delete: z.boolean().optional(),
  connect: z.lazy(() => ReservationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReservationUpdateWithoutOrdersInputSchema),z.lazy(() => ReservationUncheckedUpdateWithoutOrdersInputSchema) ]).optional(),
}).strict();

export const ItemOrdersUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateManyWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema).array(),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema),z.lazy(() => ItemOrdersCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => ItemOrdersUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ItemOrdersCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ItemOrdersWhereUniqueInputSchema),z.lazy(() => ItemOrdersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => ItemOrdersUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutOrderInputSchema),z.lazy(() => ItemOrdersUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ItemOrdersScalarWhereInputSchema),z.lazy(() => ItemOrdersScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ItemCreateNestedOneWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemCreateNestedOneWithoutItemOrdersInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutItemOrdersInputSchema),z.lazy(() => ItemUncheckedCreateWithoutItemOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ItemCreateOrConnectWithoutItemOrdersInputSchema).optional(),
  connect: z.lazy(() => ItemWhereUniqueInputSchema).optional()
}).strict();

export const OrderCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutItemsInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional()
}).strict();

export const ItemUpdateOneRequiredWithoutItemOrdersNestedInputSchema: z.ZodType<Prisma.ItemUpdateOneRequiredWithoutItemOrdersNestedInput> = z.object({
  create: z.union([ z.lazy(() => ItemCreateWithoutItemOrdersInputSchema),z.lazy(() => ItemUncheckedCreateWithoutItemOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ItemCreateOrConnectWithoutItemOrdersInputSchema).optional(),
  upsert: z.lazy(() => ItemUpsertWithoutItemOrdersInputSchema).optional(),
  connect: z.lazy(() => ItemWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ItemUpdateWithoutItemOrdersInputSchema),z.lazy(() => ItemUncheckedUpdateWithoutItemOrdersInputSchema) ]).optional(),
}).strict();

export const OrderUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutItemsInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.union([ z.string().array(),z.string() ]).optional(),
  notIn: z.union([ z.string().array(),z.string() ]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  notIn: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumRoomTypeFilterSchema: z.ZodType<Prisma.NestedEnumRoomTypeFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoomStatusFilterSchema: z.ZodType<Prisma.NestedEnumRoomStatusFilter> = z.object({
  equals: z.lazy(() => RoomStatusSchema).optional(),
  in: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => NestedEnumRoomStatusFilterSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.union([ z.number().array(),z.number() ]).optional(),
  notIn: z.union([ z.number().array(),z.number() ]).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.union([ z.string().array(),z.string() ]).optional(),
  notIn: z.union([ z.string().array(),z.string() ]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  notIn: z.union([ z.string().array(),z.string() ]).optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.union([ z.number().array(),z.number() ]).optional().nullable(),
  notIn: z.union([ z.number().array(),z.number() ]).optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumRoomTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoomTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoomTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoomTypeFilterSchema).optional()
}).strict();

export const NestedEnumRoomStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoomStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoomStatusSchema).optional(),
  in: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => RoomStatusSchema).array(),z.lazy(() => RoomStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => NestedEnumRoomStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoomStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoomStatusFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.union([ z.number().array(),z.number() ]).optional(),
  notIn: z.union([ z.number().array(),z.number() ]).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.union([ z.number().array(),z.number() ]).optional(),
  notIn: z.union([ z.number().array(),z.number() ]).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const NestedEnumGuestTypeFilterSchema: z.ZodType<Prisma.NestedEnumGuestTypeFilter> = z.object({
  equals: z.lazy(() => GuestTypeSchema).optional(),
  in: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => NestedEnumGuestTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumGuestTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumGuestTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GuestTypeSchema).optional(),
  in: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => GuestTypeSchema).array(),z.lazy(() => GuestTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => NestedEnumGuestTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGuestTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGuestTypeFilterSchema).optional()
}).strict();

export const NestedEnumRoomTypeNullableFilterSchema: z.ZodType<Prisma.NestedEnumRoomTypeNullableFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional().nullable(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumReservationStatusFilterSchema: z.ZodType<Prisma.NestedEnumReservationStatusFilter> = z.object({
  equals: z.lazy(() => ReservationStatusSchema).optional(),
  in: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => NestedEnumReservationStatusFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDecimalNullableFilterSchema: z.ZodType<Prisma.NestedDecimalNullableFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumPaymentStatusFilterSchema: z.ZodType<Prisma.NestedEnumPaymentStatusFilter> = z.object({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => NestedEnumPaymentStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoomTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoomTypeNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoomTypeSchema).optional().nullable(),
  in: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => RoomTypeSchema).array(),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NestedEnumRoomTypeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoomTypeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoomTypeNullableFilterSchema).optional()
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedEnumReservationStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReservationStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ReservationStatusSchema).optional(),
  in: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ReservationStatusSchema).array(),z.lazy(() => ReservationStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => NestedEnumReservationStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumReservationStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumReservationStatusFilterSchema).optional()
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  notIn: z.union([ z.coerce.date().array(),z.coerce.date() ]).optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const NestedDecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalNullableWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  notIn: z.union([ z.union([z.number().array(),z.string().array(),DecimalJSLikeListSchema,]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  lt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional()
}).strict();

export const NestedEnumPaymentStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPaymentStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => PaymentStatusSchema).array(),z.lazy(() => PaymentStatusSchema) ]).optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => NestedEnumPaymentStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional()
}).strict();

export const NestedEnumTaskTypeFilterSchema: z.ZodType<Prisma.NestedEnumTaskTypeFilter> = z.object({
  equals: z.lazy(() => TaskTypeSchema).optional(),
  in: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => NestedEnumTaskTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumTaskTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumTaskTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => TaskTypeSchema).optional(),
  in: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  notIn: z.union([ z.lazy(() => TaskTypeSchema).array(),z.lazy(() => TaskTypeSchema) ]).optional(),
  not: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => NestedEnumTaskTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumTaskTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumTaskTypeFilterSchema).optional()
}).strict();

export const NestedEnumItemCategoryFilterSchema: z.ZodType<Prisma.NestedEnumItemCategoryFilter> = z.object({
  equals: z.lazy(() => ItemCategorySchema).optional(),
  in: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  not: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => NestedEnumItemCategoryFilterSchema) ]).optional(),
}).strict();

export const NestedEnumItemCategoryWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumItemCategoryWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ItemCategorySchema).optional(),
  in: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  notIn: z.union([ z.lazy(() => ItemCategorySchema).array(),z.lazy(() => ItemCategorySchema) ]).optional(),
  not: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => NestedEnumItemCategoryWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumItemCategoryFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumItemCategoryFilterSchema).optional()
}).strict();

export const NestedEnumOrderStatusNullableFilterSchema: z.ZodType<Prisma.NestedEnumOrderStatusNullableFilter> = z.object({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NestedEnumOrderStatusNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedEnumOrderStatusNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumOrderStatusNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  notIn: z.union([ z.lazy(() => OrderStatusSchema).array(),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NestedEnumOrderStatusNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional()
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const ReservationCreateWithoutRoomInputSchema: z.ZodType<Prisma.ReservationCreateWithoutRoomInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  guest: z.lazy(() => GuestCreateNestedOneWithoutReservationsInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutReservationInputSchema).optional()
}).strict();

export const ReservationUncheckedCreateWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUncheckedCreateWithoutRoomInput> = z.object({
  id: z.string().cuid().optional(),
  guestId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutReservationInputSchema).optional()
}).strict();

export const ReservationCreateOrConnectWithoutRoomInputSchema: z.ZodType<Prisma.ReservationCreateOrConnectWithoutRoomInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReservationCreateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export const ReservationCreateManyRoomInputEnvelopeSchema: z.ZodType<Prisma.ReservationCreateManyRoomInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReservationCreateManyRoomInputSchema),z.lazy(() => ReservationCreateManyRoomInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const RoomImageRelationCreateWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationCreateWithoutRoomInput> = z.object({
  id: z.string().cuid().optional(),
  roomImage: z.lazy(() => RoomImageCreateNestedOneWithoutRoomImagesInputSchema)
}).strict();

export const RoomImageRelationUncheckedCreateWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedCreateWithoutRoomInput> = z.object({
  id: z.string().cuid().optional(),
  roomImageId: z.string()
}).strict();

export const RoomImageRelationCreateOrConnectWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationCreateOrConnectWithoutRoomInput> = z.object({
  where: z.lazy(() => RoomImageRelationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export const RoomImageRelationCreateManyRoomInputEnvelopeSchema: z.ZodType<Prisma.RoomImageRelationCreateManyRoomInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RoomImageRelationCreateManyRoomInputSchema),z.lazy(() => RoomImageRelationCreateManyRoomInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TaskCreateWithoutRoomInputSchema: z.ZodType<Prisma.TaskCreateWithoutRoomInput> = z.object({
  id: z.string().cuid().optional(),
  shortDesc: z.string(),
  description: z.string(),
  type: z.lazy(() => TaskTypeSchema).optional(),
  location: z.string()
}).strict();

export const TaskUncheckedCreateWithoutRoomInputSchema: z.ZodType<Prisma.TaskUncheckedCreateWithoutRoomInput> = z.object({
  id: z.string().cuid().optional(),
  shortDesc: z.string(),
  description: z.string(),
  type: z.lazy(() => TaskTypeSchema).optional(),
  location: z.string()
}).strict();

export const TaskCreateOrConnectWithoutRoomInputSchema: z.ZodType<Prisma.TaskCreateOrConnectWithoutRoomInput> = z.object({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaskCreateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export const TaskCreateManyRoomInputEnvelopeSchema: z.ZodType<Prisma.TaskCreateManyRoomInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TaskCreateManyRoomInputSchema),z.lazy(() => TaskCreateManyRoomInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ReservationUpsertWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUpsertWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReservationUpdateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedUpdateWithoutRoomInputSchema) ]),
  create: z.union([ z.lazy(() => ReservationCreateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export const ReservationUpdateWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUpdateWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReservationUpdateWithoutRoomInputSchema),z.lazy(() => ReservationUncheckedUpdateWithoutRoomInputSchema) ]),
}).strict();

export const ReservationUpdateManyWithWhereWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUpdateManyWithWhereWithoutRoomInput> = z.object({
  where: z.lazy(() => ReservationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReservationUpdateManyMutationInputSchema),z.lazy(() => ReservationUncheckedUpdateManyWithoutReservationsInputSchema) ]),
}).strict();

export const ReservationScalarWhereInputSchema: z.ZodType<Prisma.ReservationScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReservationScalarWhereInputSchema),z.lazy(() => ReservationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReservationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReservationScalarWhereInputSchema),z.lazy(() => ReservationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  guestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  roomId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => EnumRoomTypeNullableFilterSchema),z.lazy(() => RoomTypeSchema) ]).optional().nullable(),
  checkIn: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  checkOut: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumReservationStatusFilterSchema),z.lazy(() => ReservationStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  guestName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  guestEmail: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  subTotalUSD: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema),z.lazy(() => PaymentStatusSchema) ]).optional(),
}).strict();

export const RoomImageRelationUpsertWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUpsertWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => RoomImageRelationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RoomImageRelationUpdateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedUpdateWithoutRoomInputSchema) ]),
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export const RoomImageRelationUpdateWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => RoomImageRelationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RoomImageRelationUpdateWithoutRoomInputSchema),z.lazy(() => RoomImageRelationUncheckedUpdateWithoutRoomInputSchema) ]),
}).strict();

export const RoomImageRelationUpdateManyWithWhereWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateManyWithWhereWithoutRoomInput> = z.object({
  where: z.lazy(() => RoomImageRelationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RoomImageRelationUpdateManyMutationInputSchema),z.lazy(() => RoomImageRelationUncheckedUpdateManyWithoutImagesInputSchema) ]),
}).strict();

export const RoomImageRelationScalarWhereInputSchema: z.ZodType<Prisma.RoomImageRelationScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomImageRelationScalarWhereInputSchema),z.lazy(() => RoomImageRelationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomImageRelationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomImageRelationScalarWhereInputSchema),z.lazy(() => RoomImageRelationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomImageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const TaskUpsertWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.TaskUpsertWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaskUpdateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedUpdateWithoutRoomInputSchema) ]),
  create: z.union([ z.lazy(() => TaskCreateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export const TaskUpdateWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.TaskUpdateWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => TaskWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TaskUpdateWithoutRoomInputSchema),z.lazy(() => TaskUncheckedUpdateWithoutRoomInputSchema) ]),
}).strict();

export const TaskUpdateManyWithWhereWithoutRoomInputSchema: z.ZodType<Prisma.TaskUpdateManyWithWhereWithoutRoomInput> = z.object({
  where: z.lazy(() => TaskScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TaskUpdateManyMutationInputSchema),z.lazy(() => TaskUncheckedUpdateManyWithoutTasksInputSchema) ]),
}).strict();

export const TaskScalarWhereInputSchema: z.ZodType<Prisma.TaskScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TaskScalarWhereInputSchema),z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaskScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaskScalarWhereInputSchema),z.lazy(() => TaskScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shortDesc: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumTaskTypeFilterSchema),z.lazy(() => TaskTypeSchema) ]).optional(),
  roomId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  location: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const RoomImageRelationCreateWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationCreateWithoutRoomImageInput> = z.object({
  id: z.string().cuid().optional(),
  room: z.lazy(() => RoomCreateNestedOneWithoutImagesInputSchema)
}).strict();

export const RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedCreateWithoutRoomImageInput> = z.object({
  id: z.string().cuid().optional(),
  roomId: z.string()
}).strict();

export const RoomImageRelationCreateOrConnectWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationCreateOrConnectWithoutRoomImageInput> = z.object({
  where: z.lazy(() => RoomImageRelationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema) ]),
}).strict();

export const RoomImageRelationCreateManyRoomImageInputEnvelopeSchema: z.ZodType<Prisma.RoomImageRelationCreateManyRoomImageInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RoomImageRelationCreateManyRoomImageInputSchema),z.lazy(() => RoomImageRelationCreateManyRoomImageInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const RoomImageRelationUpsertWithWhereUniqueWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUpsertWithWhereUniqueWithoutRoomImageInput> = z.object({
  where: z.lazy(() => RoomImageRelationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RoomImageRelationUpdateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedUpdateWithoutRoomImageInputSchema) ]),
  create: z.union([ z.lazy(() => RoomImageRelationCreateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedCreateWithoutRoomImageInputSchema) ]),
}).strict();

export const RoomImageRelationUpdateWithWhereUniqueWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateWithWhereUniqueWithoutRoomImageInput> = z.object({
  where: z.lazy(() => RoomImageRelationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RoomImageRelationUpdateWithoutRoomImageInputSchema),z.lazy(() => RoomImageRelationUncheckedUpdateWithoutRoomImageInputSchema) ]),
}).strict();

export const RoomImageRelationUpdateManyWithWhereWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateManyWithWhereWithoutRoomImageInput> = z.object({
  where: z.lazy(() => RoomImageRelationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RoomImageRelationUpdateManyMutationInputSchema),z.lazy(() => RoomImageRelationUncheckedUpdateManyWithoutRoomImagesInputSchema) ]),
}).strict();

export const RoomCreateWithoutImagesInputSchema: z.ZodType<Prisma.RoomCreateWithoutImagesInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  reservations: z.lazy(() => ReservationCreateNestedManyWithoutRoomInputSchema).optional(),
  tasks: z.lazy(() => TaskCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomUncheckedCreateWithoutImagesInputSchema: z.ZodType<Prisma.RoomUncheckedCreateWithoutImagesInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  reservations: z.lazy(() => ReservationUncheckedCreateNestedManyWithoutRoomInputSchema).optional(),
  tasks: z.lazy(() => TaskUncheckedCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.RoomCreateOrConnectWithoutImagesInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomCreateWithoutImagesInputSchema),z.lazy(() => RoomUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export const RoomImageCreateWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageCreateWithoutRoomImagesInput> = z.object({
  id: z.string().cuid().optional(),
  fileUrl: z.string(),
  fileKey: z.string()
}).strict();

export const RoomImageUncheckedCreateWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageUncheckedCreateWithoutRoomImagesInput> = z.object({
  id: z.string().cuid().optional(),
  fileUrl: z.string(),
  fileKey: z.string()
}).strict();

export const RoomImageCreateOrConnectWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageCreateOrConnectWithoutRoomImagesInput> = z.object({
  where: z.lazy(() => RoomImageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomImageCreateWithoutRoomImagesInputSchema),z.lazy(() => RoomImageUncheckedCreateWithoutRoomImagesInputSchema) ]),
}).strict();

export const RoomUpsertWithoutImagesInputSchema: z.ZodType<Prisma.RoomUpsertWithoutImagesInput> = z.object({
  update: z.union([ z.lazy(() => RoomUpdateWithoutImagesInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutImagesInputSchema) ]),
  create: z.union([ z.lazy(() => RoomCreateWithoutImagesInputSchema),z.lazy(() => RoomUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export const RoomUpdateWithoutImagesInputSchema: z.ZodType<Prisma.RoomUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUpdateManyWithoutRoomNestedInputSchema).optional(),
  tasks: z.lazy(() => TaskUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const RoomUncheckedUpdateWithoutImagesInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUncheckedUpdateManyWithoutRoomNestedInputSchema).optional(),
  tasks: z.lazy(() => TaskUncheckedUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const RoomImageUpsertWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageUpsertWithoutRoomImagesInput> = z.object({
  update: z.union([ z.lazy(() => RoomImageUpdateWithoutRoomImagesInputSchema),z.lazy(() => RoomImageUncheckedUpdateWithoutRoomImagesInputSchema) ]),
  create: z.union([ z.lazy(() => RoomImageCreateWithoutRoomImagesInputSchema),z.lazy(() => RoomImageUncheckedCreateWithoutRoomImagesInputSchema) ]),
}).strict();

export const RoomImageUpdateWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageUpdateWithoutRoomImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageUncheckedUpdateWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageUncheckedUpdateWithoutRoomImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReservationCreateWithoutGuestInputSchema: z.ZodType<Prisma.ReservationCreateWithoutGuestInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  room: z.lazy(() => RoomCreateNestedOneWithoutReservationsInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutReservationInputSchema).optional()
}).strict();

export const ReservationUncheckedCreateWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUncheckedCreateWithoutGuestInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutReservationInputSchema).optional()
}).strict();

export const ReservationCreateOrConnectWithoutGuestInputSchema: z.ZodType<Prisma.ReservationCreateOrConnectWithoutGuestInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReservationCreateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema) ]),
}).strict();

export const ReservationCreateManyGuestInputEnvelopeSchema: z.ZodType<Prisma.ReservationCreateManyGuestInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReservationCreateManyGuestInputSchema),z.lazy(() => ReservationCreateManyGuestInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const OrderCreateWithoutGuestInputSchema: z.ZodType<Prisma.OrderCreateWithoutGuestInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  items: z.lazy(() => ItemOrdersCreateNestedManyWithoutOrderInputSchema).optional(),
  reservation: z.lazy(() => ReservationCreateNestedOneWithoutOrdersInputSchema).optional()
}).strict();

export const OrderUncheckedCreateWithoutGuestInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutGuestInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  items: z.lazy(() => ItemOrdersUncheckedCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export const OrderCreateOrConnectWithoutGuestInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutGuestInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema) ]),
}).strict();

export const OrderCreateManyGuestInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyGuestInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderCreateManyGuestInputSchema),z.lazy(() => OrderCreateManyGuestInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ReservationUpsertWithWhereUniqueWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUpsertWithWhereUniqueWithoutGuestInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReservationUpdateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedUpdateWithoutGuestInputSchema) ]),
  create: z.union([ z.lazy(() => ReservationCreateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutGuestInputSchema) ]),
}).strict();

export const ReservationUpdateWithWhereUniqueWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUpdateWithWhereUniqueWithoutGuestInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReservationUpdateWithoutGuestInputSchema),z.lazy(() => ReservationUncheckedUpdateWithoutGuestInputSchema) ]),
}).strict();

export const ReservationUpdateManyWithWhereWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUpdateManyWithWhereWithoutGuestInput> = z.object({
  where: z.lazy(() => ReservationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReservationUpdateManyMutationInputSchema),z.lazy(() => ReservationUncheckedUpdateManyWithoutReservationsInputSchema) ]),
}).strict();

export const OrderUpsertWithWhereUniqueWithoutGuestInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutGuestInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderUpdateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutGuestInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedCreateWithoutGuestInputSchema) ]),
}).strict();

export const OrderUpdateWithWhereUniqueWithoutGuestInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutGuestInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateWithoutGuestInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutGuestInputSchema) ]),
}).strict();

export const OrderUpdateManyWithWhereWithoutGuestInputSchema: z.ZodType<Prisma.OrderUpdateManyWithWhereWithoutGuestInput> = z.object({
  where: z.lazy(() => OrderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateManyMutationInputSchema),z.lazy(() => OrderUncheckedUpdateManyWithoutOrdersInputSchema) ]),
}).strict();

export const OrderScalarWhereInputSchema: z.ZodType<Prisma.OrderScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  guestId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumOrderStatusNullableFilterSchema),z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  reservationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  subTotalUSD: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  happyHour: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const GuestCreateWithoutReservationsInputSchema: z.ZodType<Prisma.GuestCreateWithoutReservationsInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutGuestInputSchema).optional()
}).strict();

export const GuestUncheckedCreateWithoutReservationsInputSchema: z.ZodType<Prisma.GuestUncheckedCreateWithoutReservationsInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutGuestInputSchema).optional()
}).strict();

export const GuestCreateOrConnectWithoutReservationsInputSchema: z.ZodType<Prisma.GuestCreateOrConnectWithoutReservationsInput> = z.object({
  where: z.lazy(() => GuestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => GuestCreateWithoutReservationsInputSchema),z.lazy(() => GuestUncheckedCreateWithoutReservationsInputSchema) ]),
}).strict();

export const RoomCreateWithoutReservationsInputSchema: z.ZodType<Prisma.RoomCreateWithoutReservationsInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  images: z.lazy(() => RoomImageRelationCreateNestedManyWithoutRoomInputSchema).optional(),
  tasks: z.lazy(() => TaskCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomUncheckedCreateWithoutReservationsInputSchema: z.ZodType<Prisma.RoomUncheckedCreateWithoutReservationsInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  images: z.lazy(() => RoomImageRelationUncheckedCreateNestedManyWithoutRoomInputSchema).optional(),
  tasks: z.lazy(() => TaskUncheckedCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomCreateOrConnectWithoutReservationsInputSchema: z.ZodType<Prisma.RoomCreateOrConnectWithoutReservationsInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomCreateWithoutReservationsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutReservationsInputSchema) ]),
}).strict();

export const OrderCreateWithoutReservationInputSchema: z.ZodType<Prisma.OrderCreateWithoutReservationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  guest: z.lazy(() => GuestCreateNestedOneWithoutOrdersInputSchema).optional(),
  items: z.lazy(() => ItemOrdersCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export const OrderUncheckedCreateWithoutReservationInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutReservationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  items: z.lazy(() => ItemOrdersUncheckedCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export const OrderCreateOrConnectWithoutReservationInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutReservationInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema) ]),
}).strict();

export const OrderCreateManyReservationInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyReservationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderCreateManyReservationInputSchema),z.lazy(() => OrderCreateManyReservationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const GuestUpsertWithoutReservationsInputSchema: z.ZodType<Prisma.GuestUpsertWithoutReservationsInput> = z.object({
  update: z.union([ z.lazy(() => GuestUpdateWithoutReservationsInputSchema),z.lazy(() => GuestUncheckedUpdateWithoutReservationsInputSchema) ]),
  create: z.union([ z.lazy(() => GuestCreateWithoutReservationsInputSchema),z.lazy(() => GuestUncheckedCreateWithoutReservationsInputSchema) ]),
}).strict();

export const GuestUpdateWithoutReservationsInputSchema: z.ZodType<Prisma.GuestUpdateWithoutReservationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutGuestNestedInputSchema).optional()
}).strict();

export const GuestUncheckedUpdateWithoutReservationsInputSchema: z.ZodType<Prisma.GuestUncheckedUpdateWithoutReservationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutGuestNestedInputSchema).optional()
}).strict();

export const RoomUpsertWithoutReservationsInputSchema: z.ZodType<Prisma.RoomUpsertWithoutReservationsInput> = z.object({
  update: z.union([ z.lazy(() => RoomUpdateWithoutReservationsInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutReservationsInputSchema) ]),
  create: z.union([ z.lazy(() => RoomCreateWithoutReservationsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutReservationsInputSchema) ]),
}).strict();

export const RoomUpdateWithoutReservationsInputSchema: z.ZodType<Prisma.RoomUpdateWithoutReservationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => RoomImageRelationUpdateManyWithoutRoomNestedInputSchema).optional(),
  tasks: z.lazy(() => TaskUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const RoomUncheckedUpdateWithoutReservationsInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateWithoutReservationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => RoomImageRelationUncheckedUpdateManyWithoutRoomNestedInputSchema).optional(),
  tasks: z.lazy(() => TaskUncheckedUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const OrderUpsertWithWhereUniqueWithoutReservationInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutReservationInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderUpdateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutReservationInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedCreateWithoutReservationInputSchema) ]),
}).strict();

export const OrderUpdateWithWhereUniqueWithoutReservationInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutReservationInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateWithoutReservationInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutReservationInputSchema) ]),
}).strict();

export const OrderUpdateManyWithWhereWithoutReservationInputSchema: z.ZodType<Prisma.OrderUpdateManyWithWhereWithoutReservationInput> = z.object({
  where: z.lazy(() => OrderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateManyMutationInputSchema),z.lazy(() => OrderUncheckedUpdateManyWithoutOrdersInputSchema) ]),
}).strict();

export const RoomCreateWithoutTasksInputSchema: z.ZodType<Prisma.RoomCreateWithoutTasksInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  reservations: z.lazy(() => ReservationCreateNestedManyWithoutRoomInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomUncheckedCreateWithoutTasksInputSchema: z.ZodType<Prisma.RoomUncheckedCreateWithoutTasksInput> = z.object({
  id: z.string().cuid().optional(),
  roomNumber: z.string(),
  roomName: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional(),
  status: z.lazy(() => RoomStatusSchema).optional(),
  capacity: z.number().int(),
  dailyRateUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  reservations: z.lazy(() => ReservationUncheckedCreateNestedManyWithoutRoomInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationUncheckedCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export const RoomCreateOrConnectWithoutTasksInputSchema: z.ZodType<Prisma.RoomCreateOrConnectWithoutTasksInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomCreateWithoutTasksInputSchema),z.lazy(() => RoomUncheckedCreateWithoutTasksInputSchema) ]),
}).strict();

export const RoomUpsertWithoutTasksInputSchema: z.ZodType<Prisma.RoomUpsertWithoutTasksInput> = z.object({
  update: z.union([ z.lazy(() => RoomUpdateWithoutTasksInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutTasksInputSchema) ]),
  create: z.union([ z.lazy(() => RoomCreateWithoutTasksInputSchema),z.lazy(() => RoomUncheckedCreateWithoutTasksInputSchema) ]),
}).strict();

export const RoomUpdateWithoutTasksInputSchema: z.ZodType<Prisma.RoomUpdateWithoutTasksInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUpdateManyWithoutRoomNestedInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const RoomUncheckedUpdateWithoutTasksInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateWithoutTasksInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => EnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RoomStatusSchema),z.lazy(() => EnumRoomStatusFieldUpdateOperationsInputSchema) ]).optional(),
  capacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  dailyRateUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUncheckedUpdateManyWithoutRoomNestedInputSchema).optional(),
  images: z.lazy(() => RoomImageRelationUncheckedUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export const ItemOrdersCreateWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersCreateWithoutItemInput> = z.object({
  id: z.string().cuid().optional(),
  quantity: z.number().int().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutItemsInputSchema)
}).strict();

export const ItemOrdersUncheckedCreateWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedCreateWithoutItemInput> = z.object({
  id: z.string().cuid().optional(),
  orderId: z.string(),
  quantity: z.number().int().optional()
}).strict();

export const ItemOrdersCreateOrConnectWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersCreateOrConnectWithoutItemInput> = z.object({
  where: z.lazy(() => ItemOrdersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema) ]),
}).strict();

export const ItemOrdersCreateManyItemInputEnvelopeSchema: z.ZodType<Prisma.ItemOrdersCreateManyItemInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ItemOrdersCreateManyItemInputSchema),z.lazy(() => ItemOrdersCreateManyItemInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ItemIngredientCreateWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientCreateWithoutParentItemsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable(),
  ingredient: z.lazy(() => ItemCreateNestedOneWithoutUsedByItemsInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedCreateWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedCreateWithoutParentItemsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  ingredientId: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable()
}).strict();

export const ItemIngredientCreateOrConnectWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientCreateOrConnectWithoutParentItemsInput> = z.object({
  where: z.lazy(() => ItemIngredientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema) ]),
}).strict();

export const ItemIngredientCreateWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientCreateWithoutIngredientInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable(),
  parentItems: z.lazy(() => ItemCreateNestedManyWithoutIngredientsInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedCreateWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedCreateWithoutIngredientInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable(),
  parentItems: z.lazy(() => ItemUncheckedCreateNestedManyWithoutIngredientsInputSchema).optional()
}).strict();

export const ItemIngredientCreateOrConnectWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientCreateOrConnectWithoutIngredientInput> = z.object({
  where: z.lazy(() => ItemIngredientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema) ]),
}).strict();

export const ItemIngredientCreateManyIngredientInputEnvelopeSchema: z.ZodType<Prisma.ItemIngredientCreateManyIngredientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ItemIngredientCreateManyIngredientInputSchema),z.lazy(() => ItemIngredientCreateManyIngredientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ItemOrdersUpsertWithWhereUniqueWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUpsertWithWhereUniqueWithoutItemInput> = z.object({
  where: z.lazy(() => ItemOrdersWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ItemOrdersUpdateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedUpdateWithoutItemInputSchema) ]),
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutItemInputSchema) ]),
}).strict();

export const ItemOrdersUpdateWithWhereUniqueWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUpdateWithWhereUniqueWithoutItemInput> = z.object({
  where: z.lazy(() => ItemOrdersWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ItemOrdersUpdateWithoutItemInputSchema),z.lazy(() => ItemOrdersUncheckedUpdateWithoutItemInputSchema) ]),
}).strict();

export const ItemOrdersUpdateManyWithWhereWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUpdateManyWithWhereWithoutItemInput> = z.object({
  where: z.lazy(() => ItemOrdersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ItemOrdersUpdateManyMutationInputSchema),z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutItemOrdersInputSchema) ]),
}).strict();

export const ItemOrdersScalarWhereInputSchema: z.ZodType<Prisma.ItemOrdersScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ItemOrdersScalarWhereInputSchema),z.lazy(() => ItemOrdersScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemOrdersScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemOrdersScalarWhereInputSchema),z.lazy(() => ItemOrdersScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  itemId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const ItemIngredientUpsertWithWhereUniqueWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUpsertWithWhereUniqueWithoutParentItemsInput> = z.object({
  where: z.lazy(() => ItemIngredientWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ItemIngredientUpdateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedUpdateWithoutParentItemsInputSchema) ]),
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutParentItemsInputSchema) ]),
}).strict();

export const ItemIngredientUpdateWithWhereUniqueWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUpdateWithWhereUniqueWithoutParentItemsInput> = z.object({
  where: z.lazy(() => ItemIngredientWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ItemIngredientUpdateWithoutParentItemsInputSchema),z.lazy(() => ItemIngredientUncheckedUpdateWithoutParentItemsInputSchema) ]),
}).strict();

export const ItemIngredientUpdateManyWithWhereWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUpdateManyWithWhereWithoutParentItemsInput> = z.object({
  where: z.lazy(() => ItemIngredientScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ItemIngredientUpdateManyMutationInputSchema),z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutIngredientsInputSchema) ]),
}).strict();

export const ItemIngredientScalarWhereInputSchema: z.ZodType<Prisma.ItemIngredientScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ItemIngredientScalarWhereInputSchema),z.lazy(() => ItemIngredientScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemIngredientScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemIngredientScalarWhereInputSchema),z.lazy(() => ItemIngredientScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ingredientId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantityUnit: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const ItemIngredientUpsertWithWhereUniqueWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUpsertWithWhereUniqueWithoutIngredientInput> = z.object({
  where: z.lazy(() => ItemIngredientWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ItemIngredientUpdateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedUpdateWithoutIngredientInputSchema) ]),
  create: z.union([ z.lazy(() => ItemIngredientCreateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedCreateWithoutIngredientInputSchema) ]),
}).strict();

export const ItemIngredientUpdateWithWhereUniqueWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUpdateWithWhereUniqueWithoutIngredientInput> = z.object({
  where: z.lazy(() => ItemIngredientWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ItemIngredientUpdateWithoutIngredientInputSchema),z.lazy(() => ItemIngredientUncheckedUpdateWithoutIngredientInputSchema) ]),
}).strict();

export const ItemIngredientUpdateManyWithWhereWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUpdateManyWithWhereWithoutIngredientInput> = z.object({
  where: z.lazy(() => ItemIngredientScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ItemIngredientUpdateManyMutationInputSchema),z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutUsedByItemsInputSchema) ]),
}).strict();

export const ItemCreateWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemCreateWithoutIngredientsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersCreateNestedManyWithoutItemInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientCreateNestedManyWithoutIngredientInputSchema).optional()
}).strict();

export const ItemUncheckedCreateWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUncheckedCreateWithoutIngredientsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUncheckedCreateNestedManyWithoutItemInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUncheckedCreateNestedManyWithoutIngredientInputSchema).optional()
}).strict();

export const ItemCreateOrConnectWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemCreateOrConnectWithoutIngredientsInput> = z.object({
  where: z.lazy(() => ItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemCreateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema) ]),
}).strict();

export const ItemCreateWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemCreateWithoutUsedByItemsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersCreateNestedManyWithoutItemInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientCreateNestedManyWithoutParentItemsInputSchema).optional()
}).strict();

export const ItemUncheckedCreateWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemUncheckedCreateWithoutUsedByItemsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUncheckedCreateNestedManyWithoutItemInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientUncheckedCreateNestedManyWithoutParentItemsInputSchema).optional()
}).strict();

export const ItemCreateOrConnectWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemCreateOrConnectWithoutUsedByItemsInput> = z.object({
  where: z.lazy(() => ItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemCreateWithoutUsedByItemsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutUsedByItemsInputSchema) ]),
}).strict();

export const ItemUpsertWithWhereUniqueWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUpsertWithWhereUniqueWithoutIngredientsInput> = z.object({
  where: z.lazy(() => ItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ItemUpdateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedUpdateWithoutIngredientsInputSchema) ]),
  create: z.union([ z.lazy(() => ItemCreateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutIngredientsInputSchema) ]),
}).strict();

export const ItemUpdateWithWhereUniqueWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUpdateWithWhereUniqueWithoutIngredientsInput> = z.object({
  where: z.lazy(() => ItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ItemUpdateWithoutIngredientsInputSchema),z.lazy(() => ItemUncheckedUpdateWithoutIngredientsInputSchema) ]),
}).strict();

export const ItemUpdateManyWithWhereWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUpdateManyWithWhereWithoutIngredientsInput> = z.object({
  where: z.lazy(() => ItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ItemUpdateManyMutationInputSchema),z.lazy(() => ItemUncheckedUpdateManyWithoutParentItemsInputSchema) ]),
}).strict();

export const ItemScalarWhereInputSchema: z.ZodType<Prisma.ItemScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ItemScalarWhereInputSchema),z.lazy(() => ItemScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ItemScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ItemScalarWhereInputSchema),z.lazy(() => ItemScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  priceUSD: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  happyHourPriceUSD: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  category: z.union([ z.lazy(() => EnumItemCategoryFilterSchema),z.lazy(() => ItemCategorySchema) ]).optional(),
  quantityInStock: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  quantityUnit: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const ItemUpsertWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemUpsertWithoutUsedByItemsInput> = z.object({
  update: z.union([ z.lazy(() => ItemUpdateWithoutUsedByItemsInputSchema),z.lazy(() => ItemUncheckedUpdateWithoutUsedByItemsInputSchema) ]),
  create: z.union([ z.lazy(() => ItemCreateWithoutUsedByItemsInputSchema),z.lazy(() => ItemUncheckedCreateWithoutUsedByItemsInputSchema) ]),
}).strict();

export const ItemUpdateWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemUpdateWithoutUsedByItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUpdateManyWithoutItemNestedInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientUpdateManyWithoutParentItemsNestedInputSchema).optional()
}).strict();

export const ItemUncheckedUpdateWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateWithoutUsedByItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutItemNestedInputSchema).optional(),
  ingredients: z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutParentItemsNestedInputSchema).optional()
}).strict();

export const GuestCreateWithoutOrdersInputSchema: z.ZodType<Prisma.GuestCreateWithoutOrdersInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional(),
  reservations: z.lazy(() => ReservationCreateNestedManyWithoutGuestInputSchema).optional()
}).strict();

export const GuestUncheckedCreateWithoutOrdersInputSchema: z.ZodType<Prisma.GuestUncheckedCreateWithoutOrdersInput> = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  surname: z.string(),
  fullName: z.string().optional().nullable(),
  email: z.string(),
  currentReservationId: z.string().optional().nullable(),
  type: z.lazy(() => GuestTypeSchema).optional(),
  reservations: z.lazy(() => ReservationUncheckedCreateNestedManyWithoutGuestInputSchema).optional()
}).strict();

export const GuestCreateOrConnectWithoutOrdersInputSchema: z.ZodType<Prisma.GuestCreateOrConnectWithoutOrdersInput> = z.object({
  where: z.lazy(() => GuestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => GuestCreateWithoutOrdersInputSchema),z.lazy(() => GuestUncheckedCreateWithoutOrdersInputSchema) ]),
}).strict();

export const ItemOrdersCreateWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersCreateWithoutOrderInput> = z.object({
  id: z.string().cuid().optional(),
  quantity: z.number().int().optional(),
  item: z.lazy(() => ItemCreateNestedOneWithoutItemOrdersInputSchema)
}).strict();

export const ItemOrdersUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedCreateWithoutOrderInput> = z.object({
  id: z.string().cuid().optional(),
  itemId: z.string(),
  quantity: z.number().int().optional()
}).strict();

export const ItemOrdersCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersCreateOrConnectWithoutOrderInput> = z.object({
  where: z.lazy(() => ItemOrdersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export const ItemOrdersCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.ItemOrdersCreateManyOrderInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ItemOrdersCreateManyOrderInputSchema),z.lazy(() => ItemOrdersCreateManyOrderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ReservationCreateWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationCreateWithoutOrdersInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  guest: z.lazy(() => GuestCreateNestedOneWithoutReservationsInputSchema).optional(),
  room: z.lazy(() => RoomCreateNestedOneWithoutReservationsInputSchema).optional()
}).strict();

export const ReservationUncheckedCreateWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationUncheckedCreateWithoutOrdersInput> = z.object({
  id: z.string().cuid().optional(),
  guestId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional()
}).strict();

export const ReservationCreateOrConnectWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationCreateOrConnectWithoutOrdersInput> = z.object({
  where: z.lazy(() => ReservationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReservationCreateWithoutOrdersInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutOrdersInputSchema) ]),
}).strict();

export const GuestUpsertWithoutOrdersInputSchema: z.ZodType<Prisma.GuestUpsertWithoutOrdersInput> = z.object({
  update: z.union([ z.lazy(() => GuestUpdateWithoutOrdersInputSchema),z.lazy(() => GuestUncheckedUpdateWithoutOrdersInputSchema) ]),
  create: z.union([ z.lazy(() => GuestCreateWithoutOrdersInputSchema),z.lazy(() => GuestUncheckedCreateWithoutOrdersInputSchema) ]),
}).strict();

export const GuestUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.GuestUpdateWithoutOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUpdateManyWithoutGuestNestedInputSchema).optional()
}).strict();

export const GuestUncheckedUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.GuestUncheckedUpdateWithoutOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  surname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  currentReservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => GuestTypeSchema),z.lazy(() => EnumGuestTypeFieldUpdateOperationsInputSchema) ]).optional(),
  reservations: z.lazy(() => ReservationUncheckedUpdateManyWithoutGuestNestedInputSchema).optional()
}).strict();

export const ItemOrdersUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUpsertWithWhereUniqueWithoutOrderInput> = z.object({
  where: z.lazy(() => ItemOrdersWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ItemOrdersUpdateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => ItemOrdersCreateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export const ItemOrdersUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUpdateWithWhereUniqueWithoutOrderInput> = z.object({
  where: z.lazy(() => ItemOrdersWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ItemOrdersUpdateWithoutOrderInputSchema),z.lazy(() => ItemOrdersUncheckedUpdateWithoutOrderInputSchema) ]),
}).strict();

export const ItemOrdersUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUpdateManyWithWhereWithoutOrderInput> = z.object({
  where: z.lazy(() => ItemOrdersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ItemOrdersUpdateManyMutationInputSchema),z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutItemsInputSchema) ]),
}).strict();

export const ReservationUpsertWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationUpsertWithoutOrdersInput> = z.object({
  update: z.union([ z.lazy(() => ReservationUpdateWithoutOrdersInputSchema),z.lazy(() => ReservationUncheckedUpdateWithoutOrdersInputSchema) ]),
  create: z.union([ z.lazy(() => ReservationCreateWithoutOrdersInputSchema),z.lazy(() => ReservationUncheckedCreateWithoutOrdersInputSchema) ]),
}).strict();

export const ReservationUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationUpdateWithoutOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  guest: z.lazy(() => GuestUpdateOneWithoutReservationsNestedInputSchema).optional(),
  room: z.lazy(() => RoomUpdateOneWithoutReservationsNestedInputSchema).optional()
}).strict();

export const ReservationUncheckedUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateWithoutOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemCreateWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemCreateWithoutItemOrdersInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  ingredients: z.lazy(() => ItemIngredientCreateNestedManyWithoutParentItemsInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientCreateNestedManyWithoutIngredientInputSchema).optional()
}).strict();

export const ItemUncheckedCreateWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemUncheckedCreateWithoutItemOrdersInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  priceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHourPriceUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  category: z.lazy(() => ItemCategorySchema),
  quantityInStock: z.number().int().optional(),
  quantityUnit: z.string().optional().nullable(),
  ingredients: z.lazy(() => ItemIngredientUncheckedCreateNestedManyWithoutParentItemsInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUncheckedCreateNestedManyWithoutIngredientInputSchema).optional()
}).strict();

export const ItemCreateOrConnectWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemCreateOrConnectWithoutItemOrdersInput> = z.object({
  where: z.lazy(() => ItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ItemCreateWithoutItemOrdersInputSchema),z.lazy(() => ItemUncheckedCreateWithoutItemOrdersInputSchema) ]),
}).strict();

export const OrderCreateWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateWithoutItemsInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  guest: z.lazy(() => GuestCreateNestedOneWithoutOrdersInputSchema).optional(),
  reservation: z.lazy(() => ReservationCreateNestedOneWithoutOrdersInputSchema).optional()
}).strict();

export const OrderUncheckedCreateWithoutItemsInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutItemsInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const OrderCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutItemsInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]),
}).strict();

export const ItemUpsertWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemUpsertWithoutItemOrdersInput> = z.object({
  update: z.union([ z.lazy(() => ItemUpdateWithoutItemOrdersInputSchema),z.lazy(() => ItemUncheckedUpdateWithoutItemOrdersInputSchema) ]),
  create: z.union([ z.lazy(() => ItemCreateWithoutItemOrdersInputSchema),z.lazy(() => ItemUncheckedCreateWithoutItemOrdersInputSchema) ]),
}).strict();

export const ItemUpdateWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemUpdateWithoutItemOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredients: z.lazy(() => ItemIngredientUpdateManyWithoutParentItemsNestedInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUpdateManyWithoutIngredientNestedInputSchema).optional()
}).strict();

export const ItemUncheckedUpdateWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateWithoutItemOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredients: z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutParentItemsNestedInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutIngredientNestedInputSchema).optional()
}).strict();

export const OrderUpsertWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutItemsInput> = z.object({
  update: z.union([ z.lazy(() => OrderUpdateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]),
}).strict();

export const OrderUpdateWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpdateWithoutItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guest: z.lazy(() => GuestUpdateOneWithoutOrdersNestedInputSchema).optional(),
  reservation: z.lazy(() => ReservationUpdateOneWithoutOrdersNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateWithoutItemsInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReservationCreateManyRoomInputSchema: z.ZodType<Prisma.ReservationCreateManyRoomInput> = z.object({
  id: z.string().cuid().optional(),
  guestId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional()
}).strict();

export const RoomImageRelationCreateManyRoomInputSchema: z.ZodType<Prisma.RoomImageRelationCreateManyRoomInput> = z.object({
  id: z.string().cuid().optional(),
  roomImageId: z.string()
}).strict();

export const TaskCreateManyRoomInputSchema: z.ZodType<Prisma.TaskCreateManyRoomInput> = z.object({
  id: z.string().cuid().optional(),
  shortDesc: z.string(),
  description: z.string(),
  type: z.lazy(() => TaskTypeSchema).optional(),
  location: z.string()
}).strict();

export const ReservationUpdateWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  guest: z.lazy(() => GuestUpdateOneWithoutReservationsNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutReservationNestedInputSchema).optional()
}).strict();

export const ReservationUncheckedUpdateWithoutRoomInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutReservationNestedInputSchema).optional()
}).strict();

export const ReservationUncheckedUpdateManyWithoutReservationsInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateManyWithoutReservationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationUpdateWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImage: z.lazy(() => RoomImageUpdateOneRequiredWithoutRoomImagesNestedInputSchema).optional()
}).strict();

export const RoomImageRelationUncheckedUpdateWithoutRoomInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImageId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationUncheckedUpdateManyWithoutImagesInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateManyWithoutImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomImageId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TaskUpdateWithoutRoomInputSchema: z.ZodType<Prisma.TaskUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TaskUncheckedUpdateWithoutRoomInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateWithoutRoomInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TaskUncheckedUpdateManyWithoutTasksInputSchema: z.ZodType<Prisma.TaskUncheckedUpdateManyWithoutTasksInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shortDesc: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaskTypeSchema),z.lazy(() => EnumTaskTypeFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationCreateManyRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationCreateManyRoomImageInput> = z.object({
  id: z.string().cuid().optional(),
  roomId: z.string()
}).strict();

export const RoomImageRelationUpdateWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUpdateWithoutRoomImageInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  room: z.lazy(() => RoomUpdateOneRequiredWithoutImagesNestedInputSchema).optional()
}).strict();

export const RoomImageRelationUncheckedUpdateWithoutRoomImageInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateWithoutRoomImageInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const RoomImageRelationUncheckedUpdateManyWithoutRoomImagesInputSchema: z.ZodType<Prisma.RoomImageRelationUncheckedUpdateManyWithoutRoomImagesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  roomId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReservationCreateManyGuestInputSchema: z.ZodType<Prisma.ReservationCreateManyGuestInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  roomType: z.lazy(() => RoomTypeSchema).optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z.lazy(() => ReservationStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
  guestName: z.string(),
  guestEmail: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional()
}).strict();

export const OrderCreateManyGuestInputSchema: z.ZodType<Prisma.OrderCreateManyGuestInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const ReservationUpdateWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUpdateWithoutGuestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  room: z.lazy(() => RoomUpdateOneWithoutReservationsNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutReservationNestedInputSchema).optional()
}).strict();

export const ReservationUncheckedUpdateWithoutGuestInputSchema: z.ZodType<Prisma.ReservationUncheckedUpdateWithoutGuestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roomType: z.union([ z.lazy(() => RoomTypeSchema),z.lazy(() => NullableEnumRoomTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  checkIn: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  checkOut: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReservationStatusSchema),z.lazy(() => EnumReservationStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  guestEmail: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentStatus: z.union([ z.lazy(() => PaymentStatusSchema),z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutReservationNestedInputSchema).optional()
}).strict();

export const OrderUpdateWithoutGuestInputSchema: z.ZodType<Prisma.OrderUpdateWithoutGuestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => ItemOrdersUpdateManyWithoutOrderNestedInputSchema).optional(),
  reservation: z.lazy(() => ReservationUpdateOneWithoutOrdersNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateWithoutGuestInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutGuestInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateManyWithoutOrdersInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reservationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OrderCreateManyReservationInputSchema: z.ZodType<Prisma.OrderCreateManyReservationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional().nullable(),
  subTotalUSD: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  happyHour: z.boolean().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const OrderUpdateWithoutReservationInputSchema: z.ZodType<Prisma.OrderUpdateWithoutReservationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  guest: z.lazy(() => GuestUpdateOneWithoutOrdersNestedInputSchema).optional(),
  items: z.lazy(() => ItemOrdersUpdateManyWithoutOrderNestedInputSchema).optional()
}).strict();

export const OrderUncheckedUpdateWithoutReservationInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutReservationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  guestId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  subTotalUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHour: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutOrderNestedInputSchema).optional()
}).strict();

export const ItemOrdersCreateManyItemInputSchema: z.ZodType<Prisma.ItemOrdersCreateManyItemInput> = z.object({
  id: z.string().cuid().optional(),
  orderId: z.string(),
  quantity: z.number().int().optional()
}).strict();

export const ItemIngredientCreateManyIngredientInputSchema: z.ZodType<Prisma.ItemIngredientCreateManyIngredientInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  quantity: z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantityUnit: z.string().optional().nullable()
}).strict();

export const ItemOrdersUpdateWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUpdateWithoutItemInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutItemsNestedInputSchema).optional()
}).strict();

export const ItemOrdersUncheckedUpdateWithoutItemInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateWithoutItemInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemOrdersUncheckedUpdateManyWithoutItemOrdersInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateManyWithoutItemOrdersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemIngredientUpdateWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUpdateWithoutParentItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredient: z.lazy(() => ItemUpdateOneWithoutUsedByItemsNestedInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedUpdateWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateWithoutParentItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredientId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemIngredientUncheckedUpdateManyWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateManyWithoutIngredientsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ingredientId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemIngredientUpdateWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUpdateWithoutIngredientInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentItems: z.lazy(() => ItemUpdateManyWithoutIngredientsNestedInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedUpdateWithoutIngredientInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateWithoutIngredientInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parentItems: z.lazy(() => ItemUncheckedUpdateManyWithoutIngredientsNestedInputSchema).optional()
}).strict();

export const ItemIngredientUncheckedUpdateManyWithoutUsedByItemsInputSchema: z.ZodType<Prisma.ItemIngredientUncheckedUpdateManyWithoutUsedByItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemUpdateWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUpdateWithoutIngredientsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUpdateManyWithoutItemNestedInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUpdateManyWithoutIngredientNestedInputSchema).optional()
}).strict();

export const ItemUncheckedUpdateWithoutIngredientsInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateWithoutIngredientsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  itemOrders: z.lazy(() => ItemOrdersUncheckedUpdateManyWithoutItemNestedInputSchema).optional(),
  usedByItems: z.lazy(() => ItemIngredientUncheckedUpdateManyWithoutIngredientNestedInputSchema).optional()
}).strict();

export const ItemUncheckedUpdateManyWithoutParentItemsInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateManyWithoutParentItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  happyHourPriceUSD: z.union([ z.union([z.number(),z.string(),DecimalJSLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => ItemCategorySchema),z.lazy(() => EnumItemCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  quantityInStock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  quantityUnit: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ItemOrdersCreateManyOrderInputSchema: z.ZodType<Prisma.ItemOrdersCreateManyOrderInput> = z.object({
  id: z.string().cuid().optional(),
  itemId: z.string(),
  quantity: z.number().int().optional()
}).strict();

export const ItemOrdersUpdateWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  item: z.lazy(() => ItemUpdateOneRequiredWithoutItemOrdersNestedInputSchema).optional()
}).strict();

export const ItemOrdersUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateWithoutOrderInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  itemId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ItemOrdersUncheckedUpdateManyWithoutItemsInputSchema: z.ZodType<Prisma.ItemOrdersUncheckedUpdateManyWithoutItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  itemId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const RoomFindFirstArgsSchema: z.ZodType<Prisma.RoomFindFirstArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereInputSchema.optional(),
  orderBy: z.union([ RoomOrderByWithRelationInputSchema.array(),RoomOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomScalarFieldEnumSchema,RoomScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RoomFindFirstOrThrowArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereInputSchema.optional(),
  orderBy: z.union([ RoomOrderByWithRelationInputSchema.array(),RoomOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomScalarFieldEnumSchema,RoomScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomFindManyArgsSchema: z.ZodType<Prisma.RoomFindManyArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereInputSchema.optional(),
  orderBy: z.union([ RoomOrderByWithRelationInputSchema.array(),RoomOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomScalarFieldEnumSchema,RoomScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomAggregateArgsSchema: z.ZodType<Prisma.RoomAggregateArgs> = z.object({
  where: RoomWhereInputSchema.optional(),
  orderBy: z.union([ RoomOrderByWithRelationInputSchema.array(),RoomOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const RoomGroupByArgsSchema: z.ZodType<Prisma.RoomGroupByArgs> = z.object({
  where: RoomWhereInputSchema.optional(),
  orderBy: z.union([ RoomOrderByWithAggregationInputSchema.array(),RoomOrderByWithAggregationInputSchema ]).optional(),
  by: RoomScalarFieldEnumSchema.array(),
  having: RoomScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const RoomFindUniqueArgsSchema: z.ZodType<Prisma.RoomFindUniqueArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereUniqueInputSchema,
}).strict()

export const RoomFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RoomFindUniqueOrThrowArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereUniqueInputSchema,
}).strict()

export const RoomImageFindFirstArgsSchema: z.ZodType<Prisma.RoomImageFindFirstArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageOrderByWithRelationInputSchema.array(),RoomImageOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomImageScalarFieldEnumSchema,RoomImageScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomImageFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RoomImageFindFirstOrThrowArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageOrderByWithRelationInputSchema.array(),RoomImageOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomImageScalarFieldEnumSchema,RoomImageScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomImageFindManyArgsSchema: z.ZodType<Prisma.RoomImageFindManyArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageOrderByWithRelationInputSchema.array(),RoomImageOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomImageScalarFieldEnumSchema,RoomImageScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomImageAggregateArgsSchema: z.ZodType<Prisma.RoomImageAggregateArgs> = z.object({
  where: RoomImageWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageOrderByWithRelationInputSchema.array(),RoomImageOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const RoomImageGroupByArgsSchema: z.ZodType<Prisma.RoomImageGroupByArgs> = z.object({
  where: RoomImageWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageOrderByWithAggregationInputSchema.array(),RoomImageOrderByWithAggregationInputSchema ]).optional(),
  by: RoomImageScalarFieldEnumSchema.array(),
  having: RoomImageScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const RoomImageFindUniqueArgsSchema: z.ZodType<Prisma.RoomImageFindUniqueArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereUniqueInputSchema,
}).strict()

export const RoomImageFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RoomImageFindUniqueOrThrowArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereUniqueInputSchema,
}).strict()

export const RoomImageRelationFindFirstArgsSchema: z.ZodType<Prisma.RoomImageRelationFindFirstArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageRelationOrderByWithRelationInputSchema.array(),RoomImageRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageRelationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomImageRelationScalarFieldEnumSchema,RoomImageRelationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomImageRelationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RoomImageRelationFindFirstOrThrowArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageRelationOrderByWithRelationInputSchema.array(),RoomImageRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageRelationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomImageRelationScalarFieldEnumSchema,RoomImageRelationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomImageRelationFindManyArgsSchema: z.ZodType<Prisma.RoomImageRelationFindManyArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageRelationOrderByWithRelationInputSchema.array(),RoomImageRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageRelationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RoomImageRelationScalarFieldEnumSchema,RoomImageRelationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const RoomImageRelationAggregateArgsSchema: z.ZodType<Prisma.RoomImageRelationAggregateArgs> = z.object({
  where: RoomImageRelationWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageRelationOrderByWithRelationInputSchema.array(),RoomImageRelationOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomImageRelationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const RoomImageRelationGroupByArgsSchema: z.ZodType<Prisma.RoomImageRelationGroupByArgs> = z.object({
  where: RoomImageRelationWhereInputSchema.optional(),
  orderBy: z.union([ RoomImageRelationOrderByWithAggregationInputSchema.array(),RoomImageRelationOrderByWithAggregationInputSchema ]).optional(),
  by: RoomImageRelationScalarFieldEnumSchema.array(),
  having: RoomImageRelationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const RoomImageRelationFindUniqueArgsSchema: z.ZodType<Prisma.RoomImageRelationFindUniqueArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereUniqueInputSchema,
}).strict()

export const RoomImageRelationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RoomImageRelationFindUniqueOrThrowArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereUniqueInputSchema,
}).strict()

export const GuestFindFirstArgsSchema: z.ZodType<Prisma.GuestFindFirstArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereInputSchema.optional(),
  orderBy: z.union([ GuestOrderByWithRelationInputSchema.array(),GuestOrderByWithRelationInputSchema ]).optional(),
  cursor: GuestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GuestScalarFieldEnumSchema,GuestScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const GuestFindFirstOrThrowArgsSchema: z.ZodType<Prisma.GuestFindFirstOrThrowArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereInputSchema.optional(),
  orderBy: z.union([ GuestOrderByWithRelationInputSchema.array(),GuestOrderByWithRelationInputSchema ]).optional(),
  cursor: GuestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GuestScalarFieldEnumSchema,GuestScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const GuestFindManyArgsSchema: z.ZodType<Prisma.GuestFindManyArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereInputSchema.optional(),
  orderBy: z.union([ GuestOrderByWithRelationInputSchema.array(),GuestOrderByWithRelationInputSchema ]).optional(),
  cursor: GuestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GuestScalarFieldEnumSchema,GuestScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const GuestAggregateArgsSchema: z.ZodType<Prisma.GuestAggregateArgs> = z.object({
  where: GuestWhereInputSchema.optional(),
  orderBy: z.union([ GuestOrderByWithRelationInputSchema.array(),GuestOrderByWithRelationInputSchema ]).optional(),
  cursor: GuestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const GuestGroupByArgsSchema: z.ZodType<Prisma.GuestGroupByArgs> = z.object({
  where: GuestWhereInputSchema.optional(),
  orderBy: z.union([ GuestOrderByWithAggregationInputSchema.array(),GuestOrderByWithAggregationInputSchema ]).optional(),
  by: GuestScalarFieldEnumSchema.array(),
  having: GuestScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const GuestFindUniqueArgsSchema: z.ZodType<Prisma.GuestFindUniqueArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereUniqueInputSchema,
}).strict()

export const GuestFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.GuestFindUniqueOrThrowArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereUniqueInputSchema,
}).strict()

export const ReservationFindFirstArgsSchema: z.ZodType<Prisma.ReservationFindFirstArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereInputSchema.optional(),
  orderBy: z.union([ ReservationOrderByWithRelationInputSchema.array(),ReservationOrderByWithRelationInputSchema ]).optional(),
  cursor: ReservationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReservationScalarFieldEnumSchema,ReservationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReservationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReservationFindFirstOrThrowArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereInputSchema.optional(),
  orderBy: z.union([ ReservationOrderByWithRelationInputSchema.array(),ReservationOrderByWithRelationInputSchema ]).optional(),
  cursor: ReservationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReservationScalarFieldEnumSchema,ReservationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReservationFindManyArgsSchema: z.ZodType<Prisma.ReservationFindManyArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereInputSchema.optional(),
  orderBy: z.union([ ReservationOrderByWithRelationInputSchema.array(),ReservationOrderByWithRelationInputSchema ]).optional(),
  cursor: ReservationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReservationScalarFieldEnumSchema,ReservationScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReservationAggregateArgsSchema: z.ZodType<Prisma.ReservationAggregateArgs> = z.object({
  where: ReservationWhereInputSchema.optional(),
  orderBy: z.union([ ReservationOrderByWithRelationInputSchema.array(),ReservationOrderByWithRelationInputSchema ]).optional(),
  cursor: ReservationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ReservationGroupByArgsSchema: z.ZodType<Prisma.ReservationGroupByArgs> = z.object({
  where: ReservationWhereInputSchema.optional(),
  orderBy: z.union([ ReservationOrderByWithAggregationInputSchema.array(),ReservationOrderByWithAggregationInputSchema ]).optional(),
  by: ReservationScalarFieldEnumSchema.array(),
  having: ReservationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ReservationFindUniqueArgsSchema: z.ZodType<Prisma.ReservationFindUniqueArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereUniqueInputSchema,
}).strict()

export const ReservationFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReservationFindUniqueOrThrowArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereUniqueInputSchema,
}).strict()

export const TaskFindFirstArgsSchema: z.ZodType<Prisma.TaskFindFirstArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereInputSchema.optional(),
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(),TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaskScalarFieldEnumSchema,TaskScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const TaskFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TaskFindFirstOrThrowArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereInputSchema.optional(),
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(),TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaskScalarFieldEnumSchema,TaskScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const TaskFindManyArgsSchema: z.ZodType<Prisma.TaskFindManyArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereInputSchema.optional(),
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(),TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaskScalarFieldEnumSchema,TaskScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const TaskAggregateArgsSchema: z.ZodType<Prisma.TaskAggregateArgs> = z.object({
  where: TaskWhereInputSchema.optional(),
  orderBy: z.union([ TaskOrderByWithRelationInputSchema.array(),TaskOrderByWithRelationInputSchema ]).optional(),
  cursor: TaskWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const TaskGroupByArgsSchema: z.ZodType<Prisma.TaskGroupByArgs> = z.object({
  where: TaskWhereInputSchema.optional(),
  orderBy: z.union([ TaskOrderByWithAggregationInputSchema.array(),TaskOrderByWithAggregationInputSchema ]).optional(),
  by: TaskScalarFieldEnumSchema.array(),
  having: TaskScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const TaskFindUniqueArgsSchema: z.ZodType<Prisma.TaskFindUniqueArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema,
}).strict()

export const TaskFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TaskFindUniqueOrThrowArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema,
}).strict()

export const ItemFindFirstArgsSchema: z.ZodType<Prisma.ItemFindFirstArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrderByWithRelationInputSchema.array(),ItemOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemScalarFieldEnumSchema,ItemScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ItemFindFirstOrThrowArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrderByWithRelationInputSchema.array(),ItemOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemScalarFieldEnumSchema,ItemScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemFindManyArgsSchema: z.ZodType<Prisma.ItemFindManyArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrderByWithRelationInputSchema.array(),ItemOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemScalarFieldEnumSchema,ItemScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemAggregateArgsSchema: z.ZodType<Prisma.ItemAggregateArgs> = z.object({
  where: ItemWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrderByWithRelationInputSchema.array(),ItemOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ItemGroupByArgsSchema: z.ZodType<Prisma.ItemGroupByArgs> = z.object({
  where: ItemWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrderByWithAggregationInputSchema.array(),ItemOrderByWithAggregationInputSchema ]).optional(),
  by: ItemScalarFieldEnumSchema.array(),
  having: ItemScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ItemFindUniqueArgsSchema: z.ZodType<Prisma.ItemFindUniqueArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereUniqueInputSchema,
}).strict()

export const ItemFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ItemFindUniqueOrThrowArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereUniqueInputSchema,
}).strict()

export const ItemIngredientFindFirstArgsSchema: z.ZodType<Prisma.ItemIngredientFindFirstArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereInputSchema.optional(),
  orderBy: z.union([ ItemIngredientOrderByWithRelationInputSchema.array(),ItemIngredientOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemIngredientWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemIngredientScalarFieldEnumSchema,ItemIngredientScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemIngredientFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ItemIngredientFindFirstOrThrowArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereInputSchema.optional(),
  orderBy: z.union([ ItemIngredientOrderByWithRelationInputSchema.array(),ItemIngredientOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemIngredientWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemIngredientScalarFieldEnumSchema,ItemIngredientScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemIngredientFindManyArgsSchema: z.ZodType<Prisma.ItemIngredientFindManyArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereInputSchema.optional(),
  orderBy: z.union([ ItemIngredientOrderByWithRelationInputSchema.array(),ItemIngredientOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemIngredientWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemIngredientScalarFieldEnumSchema,ItemIngredientScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemIngredientAggregateArgsSchema: z.ZodType<Prisma.ItemIngredientAggregateArgs> = z.object({
  where: ItemIngredientWhereInputSchema.optional(),
  orderBy: z.union([ ItemIngredientOrderByWithRelationInputSchema.array(),ItemIngredientOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemIngredientWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ItemIngredientGroupByArgsSchema: z.ZodType<Prisma.ItemIngredientGroupByArgs> = z.object({
  where: ItemIngredientWhereInputSchema.optional(),
  orderBy: z.union([ ItemIngredientOrderByWithAggregationInputSchema.array(),ItemIngredientOrderByWithAggregationInputSchema ]).optional(),
  by: ItemIngredientScalarFieldEnumSchema.array(),
  having: ItemIngredientScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ItemIngredientFindUniqueArgsSchema: z.ZodType<Prisma.ItemIngredientFindUniqueArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereUniqueInputSchema,
}).strict()

export const ItemIngredientFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ItemIngredientFindUniqueOrThrowArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereUniqueInputSchema,
}).strict()

export const OrderFindFirstArgsSchema: z.ZodType<Prisma.OrderFindFirstArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema,OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const OrderFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderFindFirstOrThrowArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema,OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const OrderFindManyArgsSchema: z.ZodType<Prisma.OrderFindManyArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema,OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const OrderAggregateArgsSchema: z.ZodType<Prisma.OrderAggregateArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const OrderGroupByArgsSchema: z.ZodType<Prisma.OrderGroupByArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithAggregationInputSchema.array(),OrderOrderByWithAggregationInputSchema ]).optional(),
  by: OrderScalarFieldEnumSchema.array(),
  having: OrderScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const OrderFindUniqueArgsSchema: z.ZodType<Prisma.OrderFindUniqueArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
}).strict()

export const OrderFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderFindUniqueOrThrowArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
}).strict()

export const ItemOrdersFindFirstArgsSchema: z.ZodType<Prisma.ItemOrdersFindFirstArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrdersOrderByWithRelationInputSchema.array(),ItemOrdersOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemOrdersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemOrdersScalarFieldEnumSchema,ItemOrdersScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemOrdersFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ItemOrdersFindFirstOrThrowArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrdersOrderByWithRelationInputSchema.array(),ItemOrdersOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemOrdersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemOrdersScalarFieldEnumSchema,ItemOrdersScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemOrdersFindManyArgsSchema: z.ZodType<Prisma.ItemOrdersFindManyArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrdersOrderByWithRelationInputSchema.array(),ItemOrdersOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemOrdersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ItemOrdersScalarFieldEnumSchema,ItemOrdersScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ItemOrdersAggregateArgsSchema: z.ZodType<Prisma.ItemOrdersAggregateArgs> = z.object({
  where: ItemOrdersWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrdersOrderByWithRelationInputSchema.array(),ItemOrdersOrderByWithRelationInputSchema ]).optional(),
  cursor: ItemOrdersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ItemOrdersGroupByArgsSchema: z.ZodType<Prisma.ItemOrdersGroupByArgs> = z.object({
  where: ItemOrdersWhereInputSchema.optional(),
  orderBy: z.union([ ItemOrdersOrderByWithAggregationInputSchema.array(),ItemOrdersOrderByWithAggregationInputSchema ]).optional(),
  by: ItemOrdersScalarFieldEnumSchema.array(),
  having: ItemOrdersScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ItemOrdersFindUniqueArgsSchema: z.ZodType<Prisma.ItemOrdersFindUniqueArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereUniqueInputSchema,
}).strict()

export const ItemOrdersFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ItemOrdersFindUniqueOrThrowArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereUniqueInputSchema,
}).strict()

export const RoomCreateArgsSchema: z.ZodType<Prisma.RoomCreateArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  data: z.union([ RoomCreateInputSchema,RoomUncheckedCreateInputSchema ]),
}).strict()

export const RoomUpsertArgsSchema: z.ZodType<Prisma.RoomUpsertArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereUniqueInputSchema,
  create: z.union([ RoomCreateInputSchema,RoomUncheckedCreateInputSchema ]),
  update: z.union([ RoomUpdateInputSchema,RoomUncheckedUpdateInputSchema ]),
}).strict()

export const RoomCreateManyArgsSchema: z.ZodType<Prisma.RoomCreateManyArgs> = z.object({
  data: z.union([ RoomCreateManyInputSchema,RoomCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const RoomDeleteArgsSchema: z.ZodType<Prisma.RoomDeleteArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  where: RoomWhereUniqueInputSchema,
}).strict()

export const RoomUpdateArgsSchema: z.ZodType<Prisma.RoomUpdateArgs> = z.object({
  select: RoomSelectSchema.optional(),
  include: RoomIncludeSchema.optional(),
  data: z.union([ RoomUpdateInputSchema,RoomUncheckedUpdateInputSchema ]),
  where: RoomWhereUniqueInputSchema,
}).strict()

export const RoomUpdateManyArgsSchema: z.ZodType<Prisma.RoomUpdateManyArgs> = z.object({
  data: z.union([ RoomUpdateManyMutationInputSchema,RoomUncheckedUpdateManyInputSchema ]),
  where: RoomWhereInputSchema.optional(),
}).strict()

export const RoomDeleteManyArgsSchema: z.ZodType<Prisma.RoomDeleteManyArgs> = z.object({
  where: RoomWhereInputSchema.optional(),
}).strict()

export const RoomImageCreateArgsSchema: z.ZodType<Prisma.RoomImageCreateArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  data: z.union([ RoomImageCreateInputSchema,RoomImageUncheckedCreateInputSchema ]),
}).strict()

export const RoomImageUpsertArgsSchema: z.ZodType<Prisma.RoomImageUpsertArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereUniqueInputSchema,
  create: z.union([ RoomImageCreateInputSchema,RoomImageUncheckedCreateInputSchema ]),
  update: z.union([ RoomImageUpdateInputSchema,RoomImageUncheckedUpdateInputSchema ]),
}).strict()

export const RoomImageCreateManyArgsSchema: z.ZodType<Prisma.RoomImageCreateManyArgs> = z.object({
  data: z.union([ RoomImageCreateManyInputSchema,RoomImageCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const RoomImageDeleteArgsSchema: z.ZodType<Prisma.RoomImageDeleteArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  where: RoomImageWhereUniqueInputSchema,
}).strict()

export const RoomImageUpdateArgsSchema: z.ZodType<Prisma.RoomImageUpdateArgs> = z.object({
  select: RoomImageSelectSchema.optional(),
  include: RoomImageIncludeSchema.optional(),
  data: z.union([ RoomImageUpdateInputSchema,RoomImageUncheckedUpdateInputSchema ]),
  where: RoomImageWhereUniqueInputSchema,
}).strict()

export const RoomImageUpdateManyArgsSchema: z.ZodType<Prisma.RoomImageUpdateManyArgs> = z.object({
  data: z.union([ RoomImageUpdateManyMutationInputSchema,RoomImageUncheckedUpdateManyInputSchema ]),
  where: RoomImageWhereInputSchema.optional(),
}).strict()

export const RoomImageDeleteManyArgsSchema: z.ZodType<Prisma.RoomImageDeleteManyArgs> = z.object({
  where: RoomImageWhereInputSchema.optional(),
}).strict()

export const RoomImageRelationCreateArgsSchema: z.ZodType<Prisma.RoomImageRelationCreateArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  data: z.union([ RoomImageRelationCreateInputSchema,RoomImageRelationUncheckedCreateInputSchema ]),
}).strict()

export const RoomImageRelationUpsertArgsSchema: z.ZodType<Prisma.RoomImageRelationUpsertArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereUniqueInputSchema,
  create: z.union([ RoomImageRelationCreateInputSchema,RoomImageRelationUncheckedCreateInputSchema ]),
  update: z.union([ RoomImageRelationUpdateInputSchema,RoomImageRelationUncheckedUpdateInputSchema ]),
}).strict()

export const RoomImageRelationCreateManyArgsSchema: z.ZodType<Prisma.RoomImageRelationCreateManyArgs> = z.object({
  data: z.union([ RoomImageRelationCreateManyInputSchema,RoomImageRelationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const RoomImageRelationDeleteArgsSchema: z.ZodType<Prisma.RoomImageRelationDeleteArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  where: RoomImageRelationWhereUniqueInputSchema,
}).strict()

export const RoomImageRelationUpdateArgsSchema: z.ZodType<Prisma.RoomImageRelationUpdateArgs> = z.object({
  select: RoomImageRelationSelectSchema.optional(),
  include: RoomImageRelationIncludeSchema.optional(),
  data: z.union([ RoomImageRelationUpdateInputSchema,RoomImageRelationUncheckedUpdateInputSchema ]),
  where: RoomImageRelationWhereUniqueInputSchema,
}).strict()

export const RoomImageRelationUpdateManyArgsSchema: z.ZodType<Prisma.RoomImageRelationUpdateManyArgs> = z.object({
  data: z.union([ RoomImageRelationUpdateManyMutationInputSchema,RoomImageRelationUncheckedUpdateManyInputSchema ]),
  where: RoomImageRelationWhereInputSchema.optional(),
}).strict()

export const RoomImageRelationDeleteManyArgsSchema: z.ZodType<Prisma.RoomImageRelationDeleteManyArgs> = z.object({
  where: RoomImageRelationWhereInputSchema.optional(),
}).strict()

export const GuestCreateArgsSchema: z.ZodType<Prisma.GuestCreateArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  data: z.union([ GuestCreateInputSchema,GuestUncheckedCreateInputSchema ]),
}).strict()

export const GuestUpsertArgsSchema: z.ZodType<Prisma.GuestUpsertArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereUniqueInputSchema,
  create: z.union([ GuestCreateInputSchema,GuestUncheckedCreateInputSchema ]),
  update: z.union([ GuestUpdateInputSchema,GuestUncheckedUpdateInputSchema ]),
}).strict()

export const GuestCreateManyArgsSchema: z.ZodType<Prisma.GuestCreateManyArgs> = z.object({
  data: z.union([ GuestCreateManyInputSchema,GuestCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const GuestDeleteArgsSchema: z.ZodType<Prisma.GuestDeleteArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  where: GuestWhereUniqueInputSchema,
}).strict()

export const GuestUpdateArgsSchema: z.ZodType<Prisma.GuestUpdateArgs> = z.object({
  select: GuestSelectSchema.optional(),
  include: GuestIncludeSchema.optional(),
  data: z.union([ GuestUpdateInputSchema,GuestUncheckedUpdateInputSchema ]),
  where: GuestWhereUniqueInputSchema,
}).strict()

export const GuestUpdateManyArgsSchema: z.ZodType<Prisma.GuestUpdateManyArgs> = z.object({
  data: z.union([ GuestUpdateManyMutationInputSchema,GuestUncheckedUpdateManyInputSchema ]),
  where: GuestWhereInputSchema.optional(),
}).strict()

export const GuestDeleteManyArgsSchema: z.ZodType<Prisma.GuestDeleteManyArgs> = z.object({
  where: GuestWhereInputSchema.optional(),
}).strict()

export const ReservationCreateArgsSchema: z.ZodType<Prisma.ReservationCreateArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  data: z.union([ ReservationCreateInputSchema,ReservationUncheckedCreateInputSchema ]),
}).strict()

export const ReservationUpsertArgsSchema: z.ZodType<Prisma.ReservationUpsertArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereUniqueInputSchema,
  create: z.union([ ReservationCreateInputSchema,ReservationUncheckedCreateInputSchema ]),
  update: z.union([ ReservationUpdateInputSchema,ReservationUncheckedUpdateInputSchema ]),
}).strict()

export const ReservationCreateManyArgsSchema: z.ZodType<Prisma.ReservationCreateManyArgs> = z.object({
  data: z.union([ ReservationCreateManyInputSchema,ReservationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ReservationDeleteArgsSchema: z.ZodType<Prisma.ReservationDeleteArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  where: ReservationWhereUniqueInputSchema,
}).strict()

export const ReservationUpdateArgsSchema: z.ZodType<Prisma.ReservationUpdateArgs> = z.object({
  select: ReservationSelectSchema.optional(),
  include: ReservationIncludeSchema.optional(),
  data: z.union([ ReservationUpdateInputSchema,ReservationUncheckedUpdateInputSchema ]),
  where: ReservationWhereUniqueInputSchema,
}).strict()

export const ReservationUpdateManyArgsSchema: z.ZodType<Prisma.ReservationUpdateManyArgs> = z.object({
  data: z.union([ ReservationUpdateManyMutationInputSchema,ReservationUncheckedUpdateManyInputSchema ]),
  where: ReservationWhereInputSchema.optional(),
}).strict()

export const ReservationDeleteManyArgsSchema: z.ZodType<Prisma.ReservationDeleteManyArgs> = z.object({
  where: ReservationWhereInputSchema.optional(),
}).strict()

export const TaskCreateArgsSchema: z.ZodType<Prisma.TaskCreateArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  data: z.union([ TaskCreateInputSchema,TaskUncheckedCreateInputSchema ]),
}).strict()

export const TaskUpsertArgsSchema: z.ZodType<Prisma.TaskUpsertArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema,
  create: z.union([ TaskCreateInputSchema,TaskUncheckedCreateInputSchema ]),
  update: z.union([ TaskUpdateInputSchema,TaskUncheckedUpdateInputSchema ]),
}).strict()

export const TaskCreateManyArgsSchema: z.ZodType<Prisma.TaskCreateManyArgs> = z.object({
  data: z.union([ TaskCreateManyInputSchema,TaskCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const TaskDeleteArgsSchema: z.ZodType<Prisma.TaskDeleteArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  where: TaskWhereUniqueInputSchema,
}).strict()

export const TaskUpdateArgsSchema: z.ZodType<Prisma.TaskUpdateArgs> = z.object({
  select: TaskSelectSchema.optional(),
  include: TaskIncludeSchema.optional(),
  data: z.union([ TaskUpdateInputSchema,TaskUncheckedUpdateInputSchema ]),
  where: TaskWhereUniqueInputSchema,
}).strict()

export const TaskUpdateManyArgsSchema: z.ZodType<Prisma.TaskUpdateManyArgs> = z.object({
  data: z.union([ TaskUpdateManyMutationInputSchema,TaskUncheckedUpdateManyInputSchema ]),
  where: TaskWhereInputSchema.optional(),
}).strict()

export const TaskDeleteManyArgsSchema: z.ZodType<Prisma.TaskDeleteManyArgs> = z.object({
  where: TaskWhereInputSchema.optional(),
}).strict()

export const ItemCreateArgsSchema: z.ZodType<Prisma.ItemCreateArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  data: z.union([ ItemCreateInputSchema,ItemUncheckedCreateInputSchema ]),
}).strict()

export const ItemUpsertArgsSchema: z.ZodType<Prisma.ItemUpsertArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereUniqueInputSchema,
  create: z.union([ ItemCreateInputSchema,ItemUncheckedCreateInputSchema ]),
  update: z.union([ ItemUpdateInputSchema,ItemUncheckedUpdateInputSchema ]),
}).strict()

export const ItemCreateManyArgsSchema: z.ZodType<Prisma.ItemCreateManyArgs> = z.object({
  data: z.union([ ItemCreateManyInputSchema,ItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ItemDeleteArgsSchema: z.ZodType<Prisma.ItemDeleteArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  where: ItemWhereUniqueInputSchema,
}).strict()

export const ItemUpdateArgsSchema: z.ZodType<Prisma.ItemUpdateArgs> = z.object({
  select: ItemSelectSchema.optional(),
  include: ItemIncludeSchema.optional(),
  data: z.union([ ItemUpdateInputSchema,ItemUncheckedUpdateInputSchema ]),
  where: ItemWhereUniqueInputSchema,
}).strict()

export const ItemUpdateManyArgsSchema: z.ZodType<Prisma.ItemUpdateManyArgs> = z.object({
  data: z.union([ ItemUpdateManyMutationInputSchema,ItemUncheckedUpdateManyInputSchema ]),
  where: ItemWhereInputSchema.optional(),
}).strict()

export const ItemDeleteManyArgsSchema: z.ZodType<Prisma.ItemDeleteManyArgs> = z.object({
  where: ItemWhereInputSchema.optional(),
}).strict()

export const ItemIngredientCreateArgsSchema: z.ZodType<Prisma.ItemIngredientCreateArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  data: z.union([ ItemIngredientCreateInputSchema,ItemIngredientUncheckedCreateInputSchema ]).optional(),
}).strict()

export const ItemIngredientUpsertArgsSchema: z.ZodType<Prisma.ItemIngredientUpsertArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereUniqueInputSchema,
  create: z.union([ ItemIngredientCreateInputSchema,ItemIngredientUncheckedCreateInputSchema ]),
  update: z.union([ ItemIngredientUpdateInputSchema,ItemIngredientUncheckedUpdateInputSchema ]),
}).strict()

export const ItemIngredientCreateManyArgsSchema: z.ZodType<Prisma.ItemIngredientCreateManyArgs> = z.object({
  data: z.union([ ItemIngredientCreateManyInputSchema,ItemIngredientCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ItemIngredientDeleteArgsSchema: z.ZodType<Prisma.ItemIngredientDeleteArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  where: ItemIngredientWhereUniqueInputSchema,
}).strict()

export const ItemIngredientUpdateArgsSchema: z.ZodType<Prisma.ItemIngredientUpdateArgs> = z.object({
  select: ItemIngredientSelectSchema.optional(),
  include: ItemIngredientIncludeSchema.optional(),
  data: z.union([ ItemIngredientUpdateInputSchema,ItemIngredientUncheckedUpdateInputSchema ]),
  where: ItemIngredientWhereUniqueInputSchema,
}).strict()

export const ItemIngredientUpdateManyArgsSchema: z.ZodType<Prisma.ItemIngredientUpdateManyArgs> = z.object({
  data: z.union([ ItemIngredientUpdateManyMutationInputSchema,ItemIngredientUncheckedUpdateManyInputSchema ]),
  where: ItemIngredientWhereInputSchema.optional(),
}).strict()

export const ItemIngredientDeleteManyArgsSchema: z.ZodType<Prisma.ItemIngredientDeleteManyArgs> = z.object({
  where: ItemIngredientWhereInputSchema.optional(),
}).strict()

export const OrderCreateArgsSchema: z.ZodType<Prisma.OrderCreateArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  data: z.union([ OrderCreateInputSchema,OrderUncheckedCreateInputSchema ]),
}).strict()

export const OrderUpsertArgsSchema: z.ZodType<Prisma.OrderUpsertArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
  create: z.union([ OrderCreateInputSchema,OrderUncheckedCreateInputSchema ]),
  update: z.union([ OrderUpdateInputSchema,OrderUncheckedUpdateInputSchema ]),
}).strict()

export const OrderCreateManyArgsSchema: z.ZodType<Prisma.OrderCreateManyArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema,OrderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const OrderDeleteArgsSchema: z.ZodType<Prisma.OrderDeleteArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema,
}).strict()

export const OrderUpdateArgsSchema: z.ZodType<Prisma.OrderUpdateArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  data: z.union([ OrderUpdateInputSchema,OrderUncheckedUpdateInputSchema ]),
  where: OrderWhereUniqueInputSchema,
}).strict()

export const OrderUpdateManyArgsSchema: z.ZodType<Prisma.OrderUpdateManyArgs> = z.object({
  data: z.union([ OrderUpdateManyMutationInputSchema,OrderUncheckedUpdateManyInputSchema ]),
  where: OrderWhereInputSchema.optional(),
}).strict()

export const OrderDeleteManyArgsSchema: z.ZodType<Prisma.OrderDeleteManyArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
}).strict()

export const ItemOrdersCreateArgsSchema: z.ZodType<Prisma.ItemOrdersCreateArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  data: z.union([ ItemOrdersCreateInputSchema,ItemOrdersUncheckedCreateInputSchema ]),
}).strict()

export const ItemOrdersUpsertArgsSchema: z.ZodType<Prisma.ItemOrdersUpsertArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereUniqueInputSchema,
  create: z.union([ ItemOrdersCreateInputSchema,ItemOrdersUncheckedCreateInputSchema ]),
  update: z.union([ ItemOrdersUpdateInputSchema,ItemOrdersUncheckedUpdateInputSchema ]),
}).strict()

export const ItemOrdersCreateManyArgsSchema: z.ZodType<Prisma.ItemOrdersCreateManyArgs> = z.object({
  data: z.union([ ItemOrdersCreateManyInputSchema,ItemOrdersCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ItemOrdersDeleteArgsSchema: z.ZodType<Prisma.ItemOrdersDeleteArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  where: ItemOrdersWhereUniqueInputSchema,
}).strict()

export const ItemOrdersUpdateArgsSchema: z.ZodType<Prisma.ItemOrdersUpdateArgs> = z.object({
  select: ItemOrdersSelectSchema.optional(),
  include: ItemOrdersIncludeSchema.optional(),
  data: z.union([ ItemOrdersUpdateInputSchema,ItemOrdersUncheckedUpdateInputSchema ]),
  where: ItemOrdersWhereUniqueInputSchema,
}).strict()

export const ItemOrdersUpdateManyArgsSchema: z.ZodType<Prisma.ItemOrdersUpdateManyArgs> = z.object({
  data: z.union([ ItemOrdersUpdateManyMutationInputSchema,ItemOrdersUncheckedUpdateManyInputSchema ]),
  where: ItemOrdersWhereInputSchema.optional(),
}).strict()

export const ItemOrdersDeleteManyArgsSchema: z.ZodType<Prisma.ItemOrdersDeleteManyArgs> = z.object({
  where: ItemOrdersWhereInputSchema.optional(),
}).strict()