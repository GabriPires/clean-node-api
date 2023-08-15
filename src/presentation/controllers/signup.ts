import { MissingParamError } from '../errors/missing-param-error'
import { badRequest } from '../helpers/http-helper'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  passwordConfirmation: z.string(),
})

export class SignUpController {
  handle(httpRequest: HttpRequest): HttpResponse {
    const result = bodySchema.safeParse(httpRequest.body)

    if (result.success === false) {
      const { error } = result
      return badRequest(
        new MissingParamError(error.issues[0].path[0] as string),
      )
    }
  }
}
