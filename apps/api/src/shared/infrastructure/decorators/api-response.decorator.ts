import { applyDecorators, Type } from "@nestjs/common"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"

import { ApiResponse, CreateData, DeleteData, ListData, PaginatedResult, UpdateData } from "../dto/api-response.dto"

/**
 * 제네릭 ApiResponse를 위한 Mixin 팩토리
 */
export function createApiResponseMixin<T>(DataClass: Type<T>) {
  class ApiResponseMixin {
    message?: string
    data?: T

    constructor(message?: string, data?: T) {
      this.message = message
      this.data = data
    }
  }
  
  Object.defineProperty(ApiResponseMixin, 'name', {
    value: `ApiResponse${DataClass.name}`,
  })
  
  return ApiResponseMixin
}

/**
 * 제네릭 PaginatedResult를 위한 Mixin 팩토리  
 */
export function createPaginatedResponseMixin<T>(DataClass: Type<T>) {
  class PaginatedResponseMixin {
    items: T[]
    totalItemCount: number
    currentPage: number
    limit: number
    totalPageCount: number

    constructor(items: T[], totalItemCount: number, currentPage: number, limit: number) {
      this.items = items
      this.totalItemCount = totalItemCount
      this.currentPage = currentPage
      this.limit = limit
      this.totalPageCount = Math.ceil(totalItemCount / limit)
    }
  }
  
  Object.defineProperty(PaginatedResponseMixin, 'name', {
    value: `PaginatedResult${DataClass.name}`,
  })
  
  return PaginatedResponseMixin
}

/**
 * 제네릭 ListData를 위한 Mixin 팩토리
 */
export function createListDataMixin<T>(DataClass: Type<T>) {
  class ListDataMixin {
    total: number
    page: number
    totalPages: number
    pageSize: number
    items: T[]

    constructor(items: T[], total: number, page: number, pageSize: number) {
      this.items = items
      this.total = total
      this.page = page
      this.pageSize = pageSize
      this.totalPages = Math.ceil(total / pageSize)
    }
  }
  
  Object.defineProperty(ListDataMixin, 'name', {
    value: `ListData${DataClass.name}`,
  })
  
  return ListDataMixin
}

/**
 * ApiResponse<T> 래퍼를 위한 커스텀 데코레이터
 * 인터셉터가 자동으로 ApiResponse로 래핑하는 것을 Swagger 문서에도 반영
 */
export const ApiOkResponseWrapper = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  const ResponseMixin = createApiResponseMixin(model)
  
  // 모델명에서 Dto 접미사 제거하고 깔끔한 제목 생성
  const cleanModelName = model.name.replace(/Dto$/, '')
  const title = cleanModelName.endsWith('Response') ? `${cleanModelName}Wrapper` : `${cleanModelName}Response`
  
  return applyDecorators(
    ApiExtraModels(ResponseMixin, model),
    ApiOkResponse({
      description: description || `The result of ${cleanModelName}`,
      schema: {
        title,
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 처리되었습니다.'
          },
          data: { $ref: getSchemaPath(model) }
        }
      },
    }),
  )
}

/**
 * ApiResponse<PaginatedResult<T>> 래퍼를 위한 커스텀 데코레이터
 * 페이지네이션된 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponsePaginated = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  const PaginatedMixin = createPaginatedResponseMixin(model)
  
  // 모델명에서 Dto 접미사 제거하고 깔끔한 제목 생성
  const cleanModelName = model.name.replace(/Dto$/, '')
  
  return applyDecorators(
    ApiExtraModels(PaginatedMixin, model),
    ApiOkResponse({
      description: description || `Paginated list of ${cleanModelName}`,
      schema: {
        title: `Paginated${cleanModelName}Wrapper`,
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 처리되었습니다.'
          },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) }
              },
              totalItemCount: {
                type: 'number',
                description: '총 항목 수',
                example: 100
              },
              currentPage: {
                type: 'number', 
                description: '현재 페이지',
                example: 1
              },
              limit: {
                type: 'number',
                description: '페이지당 항목 수', 
                example: 10
              },
              totalPageCount: {
                type: 'number',
                description: '총 페이지 수',
                example: 10
              }
            }
          }
        }
      },
    }),
  )
}

/**
 * ApiResponse<ListData<T>> 래퍼를 위한 커스텀 데코레이터
 * 리스트 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponseList = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  const ListMixin = createListDataMixin(model)
  
  // 모델명에서 Dto 접미사 제거하고 깔끔한 제목 생성
  const cleanModelName = model.name.replace(/Dto$/, '')
  
  return applyDecorators(
    ApiExtraModels(ListMixin, model),
    ApiOkResponse({
      description: description || `List of ${cleanModelName}`,
      schema: {
        title: `${cleanModelName}ListWrapper`,
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 처리되었습니다.'
          },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) }
              },
              total: {
                type: 'number',
                description: '총 항목 수',
                example: 100
              },
              page: {
                type: 'number',
                description: '현재 페이지',
                example: 1
              },
              totalPages: {
                type: 'number',
                description: '총 페이지 수',
                example: 10
              },
              pageSize: {
                type: 'number',
                description: '페이지당 항목 수',
                example: 10
              }
            }
          }
        }
      },
    }),
  )
}

/**
 * ApiResponse<CreateData> 래퍼를 위한 커스텀 데코레이터
 * 생성 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponseCreate = (description?: string) => {
  return applyDecorators(
    ApiExtraModels(CreateData),
    ApiOkResponse({
      description: description || "Resource created successfully",
      schema: {
        title: "CreateWrapper",
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 생성되었습니다.'
          },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: '생성된 리소스 ID',
                example: '123e4567-e89b-12d3-a456-426614174000'
              }
            }
          }
        }
      },
    }),
  )
}

/**
 * ApiResponse<UpdateData> 래퍼를 위한 커스텀 데코레이터
 * 수정 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponseUpdate = (description?: string) => {
  return applyDecorators(
    ApiExtraModels(UpdateData),
    ApiOkResponse({
      description: description || "Resource updated successfully",
      schema: {
        title: "UpdateWrapper",
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 수정되었습니다.'
          },
          data: {
            type: 'object',
            properties: {
              affected: {
                type: 'number',
                description: '수정된 항목 수',
                example: 1
              }
            }
          }
        }
      },
    }),
  )
}

/**
 * ApiResponse<DeleteData> 래퍼를 위한 커스텀 데코레이터
 * 삭제 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponseDelete = (description?: string) => {
  return applyDecorators(
    ApiExtraModels(DeleteData),
    ApiOkResponse({
      description: description || "Resource deleted successfully",
      schema: {
        title: "DeleteWrapper",
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 삭제되었습니다.'
          },
          data: {
            type: 'object',
            properties: {
              affected: {
                type: 'number',
                description: '삭제된 항목 수',
                example: 1
              }
            }
          }
        }
      },
    }),
  )
}

/**
 * ApiResponse<null> 래퍼를 위한 커스텀 데코레이터
 * 데이터 없는 성공 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponseEmpty = (description?: string) => {
  return applyDecorators(
    ApiOkResponse({
      description: description || "Operation completed successfully",
      schema: {
        title: "EmptyWrapper",
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '성공적으로 처리되었습니다.'
          },
          data: {
            type: 'null',
            description: '응답 데이터 없음'
          }
        }
      },
    }),
  )
}
