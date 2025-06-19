import { z } from "zod";

const VsVarianceElement = z.object({
  avg: z.number(),
  var: z.number(),
})

const TradeListElementSchema = z.object({
  code: z.string(),
  type: z.string(),
  stacksize: z.number(),
  stock: VsVarianceElement,
  price: VsVarianceElement,
});

export type TradeListElement = z.infer<typeof TradeListElementSchema>;

const TradeListElementListSchema = z.object({
  maxItems: z.number(),
  list: z.array(TradeListElementSchema),
});

export type TradeListElementList = z.infer<typeof TradeListElementListSchema>;

export const TradeListSchema = z.object({
  money: VsVarianceElement,
  selling: TradeListElementListSchema,
  buying: TradeListElementListSchema,
});

export const VsLanguageLutSchema = z.record(z.string(), z.string());

const TraderListSchema = TradeListSchema.extend({ 
  filePath: z.string(),
  traderCode: z.string(),
  traderType: z.string(),
});

export type TraderList = z.infer<typeof TraderListSchema>;

export const VsServerSchema = z.object({
  serverBranch: z.string(), 
  serverVersion: z.string(),
  assets: z.object({
    game: z.object({
      lang: z.object({
        lut: z.map(z.string(), VsLanguageLutSchema),
      }),
    }),
    survival: z.object({
      config: z.object({
        tradelists: z.array(TraderListSchema),
      }),
    }),
  }),
});

export type VsServer = z.infer<typeof VsServerSchema>;