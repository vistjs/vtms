import { Steps } from 'antd';
import { RecordType } from '../../constants';
import moment from 'moment';

const { Step } = Steps;

export default function CaseSteps({ dataSource }: { dataSource: any[] }): JSX.Element {
  return (
    <Steps direction="vertical">
      {dataSource.map((item: any, index: number) => {
        let title;
        let subInfo;
        if (item.type === RecordType.MOUSE) {
          title = item.data.type;
        } else if (item.type === RecordType.INPUT) {
          title = RecordType[item.type].toLowerCase();
          subInfo = item.data.text;
        } else {
          title = RecordType[item.type].toLowerCase();
        }
        return (
          <Step
            status="process"
            key={index}
            title={title}
            description={
              <>
                {subInfo && (
                  <div
                    style={{
                      color: 'rgba(0, 0, 0, 0.45)',
                    }}
                  >
                    {subInfo}
                  </div>
                )}
                <div>{moment(item.time).format('YYYY-MM-DD hh:mm:ss')}</div>
              </>
            }
          />
        );
      })}
    </Steps>
  );
}
