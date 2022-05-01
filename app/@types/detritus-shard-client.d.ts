import { BaseCollection } from "detritus-client/lib/collections"

declare module "detritus-client" {
  interface ClusterClient {
    metadata: {
      collectors: BaseCollection<string, (payload: any) => void>
      tempChannels: BaseCollection<string, Member>
      temp?: any
    }
  }
}

export {}
