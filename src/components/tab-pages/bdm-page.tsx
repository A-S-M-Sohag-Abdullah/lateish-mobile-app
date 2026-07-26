import { Screen } from "@/components/layout/screen";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export function BdmPage() {
  return (
    <Screen embedded title="BDM" description="Efficiency and coverage">
      <Card>
        <CardContent className="p-4">
          <Text variant="muted">
            BDM screens go here — waiting on the UI designs.
          </Text>
        </CardContent>
      </Card>
    </Screen>
  );
}
