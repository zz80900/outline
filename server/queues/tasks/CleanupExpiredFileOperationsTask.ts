import { subDays } from "date-fns";
import { Op } from "sequelize";
import { FileOperationState } from "@shared/types";
import Logger from "@server/logging/Logger";
import { FileOperation } from "@server/models";
import { TaskPriority } from "./base/BaseTask";
import type { Props } from "./base/CronTask";
import { CronTask, TaskInterval } from "./base/CronTask";

export default class CleanupExpiredFileOperationsTask extends CronTask {
  public async perform({ limit }: Props) {
    Logger.info(
      "task",
      `Expiring file operations older than ${FileOperation.expiryDays} days…`
    );
    const fileOperations = await FileOperation.unscoped().findAll({
      where: {
        createdAt: {
          [Op.lt]: subDays(new Date(), FileOperation.expiryDays),
        },
        state: {
          [Op.ne]: FileOperationState.Expired,
        },
      },
      limit,
    });
    const ephemeralOps: FileOperation[] = [];
    const normalOps: FileOperation[] = [];

    for (const fo of fileOperations) {
      if (fo.options?.ephemeral) {
        ephemeralOps.push(fo);
      } else {
        normalOps.push(fo);
      }
    }

    await Promise.all([
      ...normalOps.map((fo) => fo.expire()),
      ...ephemeralOps.map(async (fo) => {
        await fo.expire();
        // hard-delete ephemeral rows after expiry without emitting events
        await FileOperation.destroy({
          where: { id: fo.id },
          hooks: false,
        });
      }),
    ]);
    Logger.info(
      "task",
      `Expired ${fileOperations.length} file operations (${ephemeralOps.length} ephemeral hard-deleted)`
    );
  }

  public get cron() {
    return {
      interval: TaskInterval.Hour,
    };
  }

  public get options() {
    return {
      attempts: 1,
      priority: TaskPriority.Background,
    };
  }
}
