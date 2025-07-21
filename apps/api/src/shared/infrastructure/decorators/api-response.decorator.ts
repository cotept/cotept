import { applyDecorators, Type } from "@nestjs/common"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"

import { ApiResponse, CreateData, DeleteData, ListData, PaginatedResult, UpdateData } from "../dto/api-response.dto"

/**
 * ApiResponse<T> 래퍼를 위한 커스텀 데코레이터
 * 인터셉터가 자동으로 ApiResponse로 래핑하는 것을 Swagger 문서에도 반영
 */
export const ApiOkResponseWrapper = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, model),
    ApiOkResponse({
      description: description || `The result of ${model.name}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  )
}

/**
 * ApiResponse<PaginatedResult<T>> 래퍼를 위한 커스텀 데코레이터
 * 페이지네이션된 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponsePaginated = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, PaginatedResult, model),
    ApiOkResponse({
      description: description || `Paginated list of ${model.name}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PaginatedResult) },
                  {
                    properties: {
                      items: {
                        type: "array",
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  )
}

/**
 * ApiResponse<ListData<T>> 래퍼를 위한 커스텀 데코레이터
 * 리스트 응답을 Swagger 문서에 정확히 반영
 */
export const ApiOkResponseList = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, ListData, model),
    ApiOkResponse({
      description: description || `List of ${model.name}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(ListData) },
                  {
                    properties: {
                      items: {
                        type: "array",
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
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
    ApiExtraModels(ApiResponse, CreateData),
    ApiOkResponse({
      description: description || "Resource created successfully",
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(CreateData) },
            },
          },
        ],
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
    ApiExtraModels(ApiResponse, UpdateData),
    ApiOkResponse({
      description: description || "Resource updated successfully",
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(UpdateData) },
            },
          },
        ],
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
    ApiExtraModels(ApiResponse, DeleteData),
    ApiOkResponse({
      description: description || "Resource deleted successfully",
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(DeleteData) },
            },
          },
        ],
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
    ApiExtraModels(ApiResponse),
    ApiOkResponse({
      description: description || "Operation completed successfully",
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { type: "null" },
            },
          },
        ],
      },
    }),
  )
}
