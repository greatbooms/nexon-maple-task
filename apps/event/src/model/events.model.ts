import { ObjectType } from "@nestjs/graphql"
import { Paginated } from '@maple/models'
import { Event } from './event.model'

@ObjectType({ description: "이벤트 목록 리스트" })
export class Events extends Paginated(Event) {}
