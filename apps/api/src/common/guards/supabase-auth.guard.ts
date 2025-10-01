import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify as jwtVerifyFn } from 'jsonwebtoken';
import type { Request } from 'express';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  [k: string]: unknown;
}

interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  raw?: SupabaseJwtPayload;
}

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

function isSupabaseJwtPayload(v: unknown): v is SupabaseJwtPayload {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Record<string, unknown>).sub === 'string'
  );
}

// Explicitly type the verify wrapper to avoid unsafe-call
type JwtVerify = (
  token: string,
  secret: string,
) => string | Record<string, unknown>;
const jwtVerify: JwtVerify = jwtVerifyFn as unknown as JwtVerify;

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly jwtSecret = process.env.SUPABASE_JWT_SECRET;

  canActivate(ctx: ExecutionContext): boolean {
    if (!this.jwtSecret) {
      throw new UnauthorizedException('Server missing SUPABASE_JWT_SECRET');
    }

    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.headers.authorization ?? '';

    if (!auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = auth.slice(7).trim();

    try {
      const decodedUnknown: unknown = jwtVerify(token, this.jwtSecret);

      if (typeof decodedUnknown === 'string') {
        throw new UnauthorizedException('Malformed JWT');
      }

      if (!isSupabaseJwtPayload(decodedUnknown)) {
        throw new UnauthorizedException('JWT missing required claims');
      }

      req.user = {
        id: decodedUnknown.sub,
        email: decodedUnknown.email,
        role: decodedUnknown.role,
        raw: decodedUnknown,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { verify, JwtPayload } from 'jsonwebtoken';
// import type { Request } from 'express';

// interface SupabaseJwtPayload extends JwtPayload {
//   sub: string;
//   email?: string;
//   role?: string;
// }

// interface AuthUser {
//   id: string;
//   email?: string;
//   role?: string;
//   raw?: SupabaseJwtPayload;
// }
// interface AuthenticatedRequest extends Request {
//   user?: AuthUser;
// }

// @Injectable()
// export class SupabaseAuthGuard implements CanActivate {
//   private readonly jwtSecret = process.env.SUPABASE_JWT_SECRET as string;

//   canActivate(ctx: ExecutionContext): boolean {
//     if (!this.jwtSecret) {
//       throw new UnauthorizedException('Server missing SUPABASE_JWT_SECRET');
//     }

//     const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
//     const auth = req.headers.authorization ?? '';

//     if (!auth.startsWith('Bearer ')) {
//       throw new UnauthorizedException('Missing bearer token');
//     }

//     const token = auth.slice(7).trim();

//     try {
//       const decoded = verify(token, this.jwtSecret) as JwtPayload | string;

//       if (typeof decoded === 'string') {
//         throw new UnauthorizedException('Malformed JWT');
//       }

//       const payload = decoded as SupabaseJwtPayload;

//       if (!payload.sub) {
//         throw new UnauthorizedException('JWT missing sub');
//       }

//       req.user = {
//         id: payload.sub,
//         email: payload.email,
//         role: payload.role,
//         raw: payload,
//       };

//       return true;
//     } catch {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }
// }
