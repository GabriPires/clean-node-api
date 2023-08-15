import { z } from 'zod'
import { MissingParamError } from '../errors/missing-param-error'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { badRequest } from '../helpers/http-helper'
import { Controller } from '../protocols/controller'

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  passwordConfirmation: z.string(),
})

export class SignUpController implements Controller {
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
