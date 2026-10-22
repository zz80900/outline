import { NotFoundError, PaymentRequiredError } from "@server/errors";
import type { User } from "@server/models";
import { Document } from "@server/models";
import { authorize } from "@server/policies";

type Props = {
  id: string;
  user: User;
  includeState?: boolean;
};

export default async function loadDocument({
  id,
  user,
  includeState,
}: Props): Promise<Document> {
  const document = await Document.findByPk(id, {
    userId: user ? user.id : undefined,
    paranoid: false,
    includeState,
  });

  if (!document) {
    throw NotFoundError();
  }

  if (document.deletedAt) {
    // Super-administrators may read soft-deleted documents without restore permission
    if (user) {
      if (user.isSuperAdmin) {
        authorize(user, "read", document);
      } else {
        authorize(user, "restore", document);
      }
    }
  } else {
    if (user) {
      authorize(user, "read", document);
    }
  }

  if (document.isTrialImport) {
    throw PaymentRequiredError();
  }

  return document;
}
