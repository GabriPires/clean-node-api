import { InvalidParamError, MissingParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols'
import { SignUpController } from './signup'

interface SutType {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutType => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true
    }
  }

  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)
  return {
    sut,
    emailValidatorStub,
  }
}

describe('SignUp Controller', () => {
  test('should return 400 if no name is provided', () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        // name: 'John Doe',
        email: 'email@email.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      },
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(MissingParamError)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('should return 400 if no email is provided', () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'John Doe',
        // email: 'email@email.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      },
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(MissingParamError)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'John Doe',
        email: 'email@email.com',
        // password: 'password123',
        passwordConfirmation: 'password123',
      },
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(MissingParamError)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation is provided', () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'John Doe',
        email: 'email@email.com',
        password: 'password123',
        // passwordConfirmation: 'password123',
      },
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(MissingParamError)
    expect(httpResponse.body).toEqual(
      new MissingParamError('passwordConfirmation'),
    )
  })

  test('should return 400 if an invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSut()

    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: 'John Doe',
        email: 'invalid_email',
        password: 'password123',
        passwordConfirmation: 'password123',
      },
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(InvalidParamError)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('should call email validator with correct email', () => {
    const { sut, emailValidatorStub } = makeSut()

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'John Doe',
        email: 'email@email.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      },
    }

    sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

  test('should return 500 if email validator throws', () => {
    const { sut, emailValidatorStub } = makeSut()

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new ServerError()
    })

    const httpRequest = {
      body: {
        name: 'John Doe',
        email: 'invalid_email',
        password: 'password123',
        passwordConfirmation: 'password123',
      },
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
